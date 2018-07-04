package org.onap.sdc.workflow.services.impl;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.persistence.types.VersionStatus;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.api.types.VersionRequestDto;
import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.InvalidArtifactException;
import org.onap.sdc.workflow.services.exceptions.VersioningErrorException;
import org.onap.sdc.workflow.services.mappers.VersionMapper;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.types.VersionCreationMethod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service("workflowVersionManager")
public class WorkflowVersionManagerImpl  implements WorkflowVersionManager {

    private final VersioningManager versioningManager;
    private final ArtifactRepository artifactRepository;
    private VersionMapper versionMapper;


    @Autowired
    public WorkflowVersionManagerImpl(VersioningManager versioningManager, ArtifactRepository artifactRepository,
            VersionMapper versionMapper) {
        this.versioningManager = versioningManager;
        this.artifactRepository = artifactRepository;
        this.versionMapper = versionMapper;
    }

    @Override
    public Collection<WorkflowVersion> list(String workflowId) {
        return versioningManager.list(workflowId).stream().map(version -> versionMapper.versionToWorkflowVersion(version))
                                .collect(Collectors.toList());
    }

    @Override
    public WorkflowVersion get(String workflowId,String versionId) {

        Version version = new Version(versionId);
        try {
            return this.versionMapper.versionToWorkflowVersion(versioningManager.get(workflowId, version));
        } catch (Exception e) {
            throw new EntityNotFoundException(
                    String.format("version with id '%s' does not exist for workflow with id %s", version.getId(),
                            workflowId));
        }
    }

    @Override
    public WorkflowVersion create(String workflowId, VersionRequestDto versionRequest) {

        WorkflowVersion baseVersion = get(workflowId,versionRequest.getBaseVersionId());
        Version version = new Version();
        version.setDescription(versionRequest.getDescription());
        version.setBaseId(versionRequest.getBaseVersionId());

        if(Objects.nonNull(baseVersion) && VersionStatus.Draft.equals(baseVersion.getStatus())) {
            throw new VersioningErrorException(workflowId, versionRequest.getBaseVersionId());
        }

        Version createdVersion =  versioningManager.create(workflowId,version, VersionCreationMethod.major);

        if(isFirstVersionCreation(workflowId,createdVersion)) {
            artifactRepository.createArtifactStructure(workflowId, createdVersion.getId());
        }

        versioningManager.publish(workflowId,createdVersion,"Initial version");

        return versionMapper.versionToWorkflowVersion(createdVersion);
    }

    @Override
    public void update(String id,WorkflowVersion version) {

        Version versionToUpdate = mapVersionInfo(id,version);
        versioningManager.updateVersion(id,versionToUpdate);
        versioningManager.publish(id,versionToUpdate,"Update version");
    }


    @Override
    public void uploadArtifact(String workflowId, WorkflowVersion version, MultipartFile artifact) {

       try(InputStream artifactData = artifact.getInputStream()) {
           String fileName = StringUtils.cleanPath(artifact.getOriginalFilename());
           artifactRepository.updateArtifact(workflowId, version.getId(), fileName, artifactData);
           versioningManager.publish(workflowId, versionMapper.workflowVersionToVersion(version), "Update Artifact");

       } catch (IOException e) {
           throw new InvalidArtifactException(e.getMessage());
       }
    }

    @Override
    public ArtifactEntity getArtifact(String workflowId, WorkflowVersion version) {
        WorkflowVersion retrievedVersion = get(workflowId,version.getId());
        Optional<ArtifactEntity> artifactOptional = artifactRepository.getArtifact(workflowId, retrievedVersion.getId());
        if (!artifactOptional.isPresent()) {
            throw new EntityNotFoundException(
                    String.format("Artifact for workflow id %S version id %S was not found", workflowId, version.getId()));
        }
         return artifactOptional.get();
    }

    private boolean isFirstVersionCreation(String id, Version createdVersion) {
        return Objects.isNull(createdVersion.getBaseId()) &&
                       versioningManager.list(id).size() == 1;
    }

    protected Version mapVersionInfo(String id, WorkflowVersion workflowVersion) {
        WorkflowVersion retrievedVersion = get(id,workflowVersion.getId());
        Version version = new Version(workflowVersion.getId());
        version.setBaseId(retrievedVersion.getBaseId());
        version.setMajor(retrievedVersion.getMajor());
        version.setMinor(retrievedVersion.getMinor());
        version.setName(retrievedVersion.getName());
        return version;
    }


}
