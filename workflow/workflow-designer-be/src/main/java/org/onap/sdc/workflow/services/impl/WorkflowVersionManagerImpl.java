package org.onap.sdc.workflow.services.impl;

import static org.openecomp.sdc.versioning.dao.types.VersionStatus.Certified;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.api.types.VersionRequestDto;
import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.onap.sdc.workflow.persistence.ParameterRepository;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterRole;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.InvalidArtifactException;
import org.onap.sdc.workflow.services.exceptions.VersionCreationException;
import org.onap.sdc.workflow.services.exceptions.VersionModificationException;
import org.onap.sdc.workflow.services.exceptions.VersionStateModificationException;
import org.onap.sdc.workflow.services.impl.mappers.VersionMapper;
import org.onap.sdc.workflow.services.impl.mappers.VersionStateMapper;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.types.VersionCreationMethod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service("workflowVersionManager")
public class WorkflowVersionManagerImpl implements WorkflowVersionManager {

    private static final String VERSION_NOT_EXIST_MSG = "version with id '%s' does not exist for workflow with id '%s'";
    private final VersioningManager versioningManager;
    private final ArtifactRepository artifactRepository;
    private final ParameterRepository parameterRepository;
    private final VersionMapper versionMapper;
    private final VersionStateMapper versionStateMapper;


    @Autowired
    public WorkflowVersionManagerImpl(VersioningManager versioningManager, ArtifactRepository artifactRepository,
            VersionMapper versionMapper, VersionStateMapper versionStateMapper,
            ParameterRepository parameterRepository) {
        this.versioningManager = versioningManager;
        this.artifactRepository = artifactRepository;
        this.parameterRepository = parameterRepository;
        this.versionMapper = versionMapper;
        this.versionStateMapper = versionStateMapper;
    }

    @Override
    public Collection<WorkflowVersion> list(String workflowId) {
        Collection<WorkflowVersion> versions =
                versioningManager.list(workflowId).stream().map(versionMapper::versionToWorkflowVersion)
                                 .collect(Collectors.toList());
        versions.forEach(workflowVersion -> addVersionParameters(workflowId,workflowVersion));

        return  versions;
    }

    @Override
    public WorkflowVersion get(String workflowId, String versionId) {
        WorkflowVersion workflowVersion = versionMapper.versionToWorkflowVersion(getVersion(workflowId, versionId));
        addVersionParameters(workflowId,workflowVersion);
        return workflowVersion;

    }


    @Override
    public WorkflowVersion create(String workflowId, VersionRequestDto versionRequest) {
        List<Version> versions = versioningManager.list(workflowId);

        if (versionRequest.getBaseVersionId() != null) {
            validateVersionExistAndCertified(workflowId, versions, versionRequest.getBaseVersionId());
        } else if (!versions.isEmpty()) {
            throw new VersionCreationException(workflowId);
        }

        Version version = new Version();
        version.setDescription(versionRequest.getDescription());
        version.setBaseId(versionRequest.getBaseVersionId());
        Version createdVersion = versioningManager.create(workflowId, version, VersionCreationMethod.major);

        if (versions.isEmpty()) { // only for first version
            artifactRepository.createStructure(workflowId, createdVersion.getId());
            parameterRepository.createStructure(workflowId, createdVersion.getId());
            versioningManager.publish(workflowId, createdVersion, "Add workflow structure");
        }

        updateVersionParameters(workflowId,  createdVersion.getId(), ParameterRole.INPUT, versionRequest.getInputs());
        updateVersionParameters(workflowId,  createdVersion.getId(), ParameterRole.OUTPUT, versionRequest.getOutputs());

        return get(workflowId, createdVersion.getId());
    }

    @Override
    public void update(String workflowId, WorkflowVersion workflowVersion) {
        Version retrievedVersion = getVersion(workflowId, workflowVersion.getId());
        if (WorkflowVersionState.CERTIFIED
            .equals(versionStateMapper.versionStatusToWorkflowVersionState(retrievedVersion.getStatus()))) {
            throw new VersionModificationException(workflowId, workflowVersion.getId());
        }

        Version version = versionMapper.workflowVersionToVersion(workflowVersion);
        version.setName(retrievedVersion.getName());
        version.setStatus(retrievedVersion.getStatus());

        updateVersionParameters(workflowId, version.getId(), ParameterRole.INPUT, workflowVersion.getInputs());
        updateVersionParameters(workflowId, version.getId(), ParameterRole.OUTPUT, workflowVersion.getOutputs());

        versioningManager.updateVersion(workflowId, version);
        versioningManager.publish(workflowId, version, "Update version");
    }

    @Override
    public WorkflowVersionState getState(String workflowId, String versionId) {
        return versionStateMapper.versionStatusToWorkflowVersionState(getVersion(workflowId, versionId).getStatus());
    }

    @Override
    public void updateState(String workflowId, String versionId, WorkflowVersionState state) {
        Version retrievedVersion = getVersion(workflowId, versionId);
        WorkflowVersionState retrievedState =
            versionStateMapper.versionStatusToWorkflowVersionState(retrievedVersion.getStatus());
        if (WorkflowVersionState.CERTIFIED.equals(retrievedState) || retrievedState.equals(state)) {
            throw new VersionStateModificationException(workflowId, versionId, retrievedState, state);
        }

        retrievedVersion.setStatus(versionStateMapper.workflowVersionStateToVersionStatus(state));
        versioningManager.updateVersion(workflowId, retrievedVersion);
        versioningManager.publish(workflowId, retrievedVersion,
            String.format("Update version state from %s to %s", retrievedState.name(), state.name()));
    }

    @Override
    public void uploadArtifact(String workflowId, String versionId, MultipartFile artifact) {
        Version retrievedVersion = getVersion(workflowId, versionId);
        if (WorkflowVersionState.CERTIFIED
            .equals(versionStateMapper.versionStatusToWorkflowVersionState(retrievedVersion.getStatus()))) {
            throw new VersionModificationException(workflowId, versionId);
        }

        try (InputStream artifactData = artifact.getInputStream()) {
            ArtifactEntity artifactEntity =
                new ArtifactEntity(StringUtils.cleanPath(artifact.getOriginalFilename()), artifactData);
            artifactRepository.update(workflowId, versionId, artifactEntity);
            versioningManager.publish(workflowId, new Version(versionId), "Update Artifact");

        } catch (IOException e) {
            throw new InvalidArtifactException(e.getMessage());
        }
    }

    @Override
    public ArtifactEntity getArtifact(String workflowId, String versionId) {
        getVersion(workflowId, versionId);
        Optional<ArtifactEntity> artifactOptional = artifactRepository.get(workflowId, versionId);
        if (!artifactOptional.isPresent()) {
            throw new EntityNotFoundException(
                String.format("Artifact for workflow id %S version id %S was not found", workflowId, versionId));
        }
        return artifactOptional.get();
    }

    @Override
    public void deleteArtifact(String workflowId, String versionId) {
        WorkflowVersion retrievedVersion = get(workflowId, versionId);
        if (WorkflowVersionState.CERTIFIED.equals(retrievedVersion.getState())) {
            throw new VersionModificationException(workflowId, versionId);
        }

        artifactRepository.delete(workflowId, versionId);
        versioningManager.publish(workflowId, new Version(versionId), "Delete Artifact");
    }

    private void validateVersionExistAndCertified(String workflowId, List<Version> versions, String versionId) {
        Version baseVersion = findVersion(versions, versionId).orElseThrow(
            () -> new EntityNotFoundException(String.format(VERSION_NOT_EXIST_MSG, versionId, workflowId)));

        if (!Certified.equals(baseVersion.getStatus())) {
            throw new VersionCreationException(workflowId, versionId);
        }
    }


    private Version getVersion(String workflowId, String versionId) {
        try {
            Version version = versioningManager.get(workflowId, new Version(versionId));
            if (version == null) {
                throw new EntityNotFoundException(String.format(VERSION_NOT_EXIST_MSG, versionId, workflowId));
            }
            return version;
        } catch (Exception e) {
            throw new EntityNotFoundException(String.format(VERSION_NOT_EXIST_MSG, versionId, workflowId));
        }
    }

    private void updateVersionParameters(String workflowId, String versionId, ParameterRole role,
            Collection<ParameterEntity> parameters) {

        Collection<ParameterEntity> retrievedParameters = parameterRepository.list(workflowId, versionId, role);

        parameters.forEach(parameterEntity -> {
            if (retrievedParameters.stream().anyMatch(
                    parameterEntity1 -> parameterEntity.getName().equals(parameterEntity1.getName()))) {
                parameterRepository.update(workflowId, versionId, role, parameterEntity);
            } else {
                parameterRepository.create(workflowId, versionId, role, parameterEntity);
            }
        });

        retrievedParameters.forEach(parameterEntity -> {
            if (parameters.stream().noneMatch(
                    parameterEntity1 -> parameterEntity.getName().equals(parameterEntity1.getName()))) {
                parameterRepository.delete(workflowId, versionId, parameterEntity.getId());
            }
        });
    }

    private static Optional<Version> findVersion(List<Version> versions, String versionId) {
        return versions.stream().filter(version -> versionId.equals(version.getId())).findFirst();
    }

    private void addVersionParameters(String workflowId, WorkflowVersion workflowVersion) {
        workflowVersion.setInputs(parameterRepository.list(workflowId, workflowVersion.getId(), ParameterRole.INPUT));
        workflowVersion.setOutputs(parameterRepository.list(workflowId, workflowVersion.getId(), ParameterRole.OUTPUT));
    }
}