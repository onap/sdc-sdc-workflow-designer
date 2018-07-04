package org.onap.sdc.workflow.services.impl;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.InvalidArtifactException;
import org.onap.sdc.workflow.services.exceptions.VersioningErrorException;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;
import org.openecomp.sdc.versioning.types.VersionCreationMethod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service("workflowVersionManager")
public class WorkflowVersionManagerImpl  implements WorkflowVersionManager {

    private final VersioningManager versioningManager;
    private final ArtifactRepository artifactRepository;


    @Autowired
    public WorkflowVersionManagerImpl(VersioningManager versioningManager, ArtifactRepository artifactRepository) {
        this.versioningManager = versioningManager;
        this.artifactRepository = artifactRepository;
    }

    @Override
    public Collection<Version> list(String id) {
        return versioningManager.list(id);
    }

    @Override
    public Version get(String id,Version version) {

        try {
            return versioningManager.get(id, version);
        } catch (Exception e) {
            throw new EntityNotFoundException(
                    String.format("version with id '%s' does not exist for workflow with id %s", version.getId(), id));
        }
    }

    @Override
    public Version create(String id, Version version) {

        Version latestVersion = getLatestVersion(id);

        if (Objects.nonNull(latestVersion)) {
            version.setBaseId(latestVersion.getId());

            if(VersionStatus.Draft.equals(latestVersion.getStatus()))
                throw new VersioningErrorException(id,latestVersion.getName());
        }

        Version createdVersion =  versioningManager.create(id,version, VersionCreationMethod.major);

        if(Objects.isNull(createdVersion.getBaseId())) {
            artifactRepository.createArtifactStructure(id, createdVersion);
        }

        versioningManager.publish(id,createdVersion,"Initial version");

        return createdVersion;
    }

    @Override
    public void update(String id,Version version) {
        versioningManager.updateVersion(id,version);
    }

    @Override
    public void updateArtifact(String id, Version version, MultipartFile artifact) {
        InputStream artifactData = getArtifactData(artifact);
        String fileName = StringUtils.cleanPath(artifact.getOriginalFilename());
        artifactRepository.updateArtifact(id, version, fileName,artifactData);
        versioningManager.publish(id,version,"Update Artifact");
    }

    @Override
    public Resource getArtifactData(String id, Version version) {
        Version retrievedVersion = get(id,version);
        Optional<InputStream> artifactOptional = artifactRepository.getArtifactData(id, retrievedVersion);
        if (!artifactOptional.isPresent()) {
            throw new EntityNotFoundException(
                    String.format("Artifact for workflow id %S version id %S was not found", id, version.getId()));
        }

      return new InputStreamResource(artifactOptional.get());
    }

    @Override
    public String getArtifactFileName(String id, Version version) {
        Version retrievedVersion = get(id,version);
        Optional<String> artifactOptional = artifactRepository.getArtifactFileName(id, retrievedVersion);
        if (!artifactOptional.isPresent()) {
            throw new EntityNotFoundException(
                    String.format("Artifact for workflow id %S version id %S was not found", id, version.getId()));
        }

        return artifactOptional.get();
    }


    protected Version getLatestVersion(String itemId) {
        List<Version> list = versioningManager.list(itemId);
        return list.stream().max(Version::compareTo).orElse(null);
    }

    private InputStream getArtifactData(MultipartFile artifact) {
        try {
            return artifact.getInputStream();
        }
        catch (IOException e){
            throw new InvalidArtifactException(e.getMessage());
        }
    }

}
