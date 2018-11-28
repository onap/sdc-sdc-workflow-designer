/*
 * Copyright © 2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onap.sdc.workflow.services.impl;

import static org.onap.sdc.workflow.services.types.WorkflowVersionState.CERTIFIED;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.onap.sdc.workflow.persistence.ParameterRepository;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterRole;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.InvalidArtifactException;
import org.onap.sdc.workflow.services.exceptions.VersionCreationException;
import org.onap.sdc.workflow.services.exceptions.VersionModificationException;
import org.onap.sdc.workflow.services.exceptions.VersionStateModificationException;
import org.onap.sdc.workflow.services.exceptions.VersionStateModificationMissingArtifactException;
import org.onap.sdc.workflow.services.exceptions.WorkflowModificationException;
import org.onap.sdc.workflow.services.impl.mappers.VersionMapper;
import org.onap.sdc.workflow.services.impl.mappers.VersionStateMapper;
import org.onap.sdc.workflow.services.types.WorkflowVersion;
import org.onap.sdc.workflow.services.types.WorkflowVersionState;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;
import org.openecomp.sdc.versioning.types.Item;
import org.openecomp.sdc.versioning.types.ItemStatus;
import org.openecomp.sdc.versioning.types.VersionCreationMethod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service("workflowVersionManager")
public class WorkflowVersionManagerImpl implements WorkflowVersionManager {

    private static final String VERSION_NOT_EXIST_MSG = "version with id '%s' does not exist for workflow with id '%s'";
    private final VersioningManager versioningManager;
    private final ItemManager itemManager;
    private final ArtifactRepository artifactRepository;
    private final ParameterRepository parameterRepository;
    private final VersionMapper versionMapper;
    private final VersionStateMapper versionStateMapper;
    private static final Logger LOGGER = LoggerFactory.getLogger(WorkflowVersionManagerImpl.class);

    @Autowired
    public WorkflowVersionManagerImpl(VersioningManager versioningManager, ArtifactRepository artifactRepository,
            VersionMapper versionMapper, VersionStateMapper versionStateMapper, ItemManager itemManager,
            ParameterRepository parameterRepository) {
        this.itemManager = itemManager;
        this.versioningManager = versioningManager;
        this.artifactRepository = artifactRepository;
        this.parameterRepository = parameterRepository;
        this.versionMapper = versionMapper;
        this.versionStateMapper = versionStateMapper;
    }

    @Override
    public Collection<WorkflowVersion> list(String workflowId, Set<WorkflowVersionState> stateFilter) {
        Set<VersionStatus> versionStatusFilter =
                stateFilter == null ? null :
                        stateFilter.stream().map(versionStateMapper::workflowVersionStateToVersionStatus)
                                           .collect(Collectors.toSet());

        return versioningManager.list(workflowId).stream()
                                .filter(version -> versionStatusFilter == null || versionStatusFilter.contains(
                                        version.getStatus()))
                                .map(versionMapper::versionToWorkflowVersion)
                                .sorted(Comparator.comparing(WorkflowVersion::getName).reversed())
                                .peek(workflowVersion -> loadAndAddParameters(workflowId, workflowVersion))
                                .collect(Collectors.toList());
    }

    @Override
    public WorkflowVersion get(String workflowId, String versionId) {
        WorkflowVersion workflowVersion = versionMapper.versionToWorkflowVersion(getVersion(workflowId, versionId));
        loadAndAddParameters(workflowId, workflowVersion);
        workflowVersion.setHasArtifact(artifactRepository.isExist(workflowId,versionId));
        return workflowVersion;
    }

    @Override
    public WorkflowVersion create(String workflowId, String baseVersionId, WorkflowVersion workflowVersion) {
        validateWorkflowStatus(workflowId);
        List<Version> versions = versioningManager.list(workflowId);

        if (baseVersionId != null) {
            if (!workflowVersion.getInputs().isEmpty() || !workflowVersion.getOutputs().isEmpty()) {
                throw new VersionCreationException(workflowId, baseVersionId, "Inputs/Outputs should not be supplied");
            }
            validateVersionExistAndCertified(workflowId, versions, baseVersionId);
        } else if (!versions.isEmpty()) {
            throw new VersionCreationException(workflowId);
        }

        Version version = new Version();
        version.setDescription(workflowVersion.getDescription());
        version.setBaseId(baseVersionId);
        Version createdVersion = versioningManager.create(workflowId, version, VersionCreationMethod.major);

        if (versions.isEmpty()) { // only for first version
            artifactRepository.createStructure(workflowId, createdVersion.getId());
            parameterRepository.createStructure(workflowId, createdVersion.getId());
            updateParameters(workflowId, createdVersion.getId(), workflowVersion.getInputs(), workflowVersion.getOutputs());
            versioningManager.publish(workflowId, createdVersion, "Add initial data");
        }

        return get(workflowId, createdVersion.getId());
    }

    @Override
    public void update(String workflowId, WorkflowVersion workflowVersion) {
        validateWorkflowStatus(workflowId);
        Version retrievedVersion = getVersion(workflowId, workflowVersion.getId());
        if (CERTIFIED.equals(versionStateMapper.versionStatusToWorkflowVersionState(retrievedVersion.getStatus()))) {
            throw new VersionModificationException(workflowId, workflowVersion.getId());
        }

        Version version = versionMapper.workflowVersionToVersion(workflowVersion);
        version.setName(retrievedVersion.getName());
        version.setStatus(retrievedVersion.getStatus());

        updateParameters(workflowId, version.getId(), workflowVersion.getInputs(), workflowVersion.getOutputs());

        versioningManager.updateVersion(workflowId, version);

        Version updatedVersion = versioningManager.get(workflowId, version);
        if(updatedVersion.getState().isDirty()) {
            versioningManager.publish(workflowId, version, "Update version");
        }
    }


    @Override
    public WorkflowVersionState getState(String workflowId, String versionId) {
        return versionStateMapper.versionStatusToWorkflowVersionState(getVersion(workflowId, versionId).getStatus());
    }

    @Override
    public void updateState(String workflowId, String versionId, WorkflowVersionState newState) {
        WorkflowVersionState currentState = getState(workflowId, versionId);
        if (newState == CERTIFIED) {
            if(!artifactRepository.isExist(workflowId,versionId)){
                throw new VersionStateModificationMissingArtifactException(workflowId, versionId, currentState,
                        newState);
            }
            try {
                versioningManager.submit(workflowId, new Version(versionId),
                        String.format("Update version state to %s", newState.name()));
            } catch (Exception submitException) {
                throw new VersionStateModificationException(workflowId, versionId, currentState, newState,
                        submitException);
            }
        } else {
            throw new VersionStateModificationException(workflowId, versionId, currentState, newState);
        }
    }

    @Override
    public void uploadArtifact(String workflowId, String versionId, MultipartFile artifact) {
        validateWorkflowStatus(workflowId);
        Version retrievedVersion = getVersion(workflowId, versionId);
        if (CERTIFIED.equals(versionStateMapper.versionStatusToWorkflowVersionState(retrievedVersion.getStatus()))) {
            throw new VersionModificationException(workflowId, versionId);
        }

        try (InputStream artifactData = artifact.getInputStream()) {
            ArtifactEntity artifactEntity =
                    new ArtifactEntity(StringUtils.cleanPath(artifact.getOriginalFilename()), artifactData);
            artifactRepository.update(workflowId, versionId, artifactEntity);
            Version updatedVersion = versioningManager.get(workflowId, new Version(versionId));
            if(updatedVersion.getState().isDirty()) {
                versioningManager.publish(workflowId, updatedVersion, "Update artifact");
            }

        } catch (IOException e) {
            LOGGER.error(String.format("Upload Artifact failed for workflow id %s and version id %s",
                    workflowId, versionId),e);
            throw new InvalidArtifactException(e.getMessage());
        }
    }

    @Override
    public ArtifactEntity getArtifact(String workflowId, String versionId) {
        getVersion(workflowId, versionId);
        Optional<ArtifactEntity> artifactOptional = artifactRepository.get(workflowId, versionId);
        if (!artifactOptional.isPresent()) {
            LOGGER.error("Workflow Version Artifact was not found for workflow id {} and version id {}",
                    workflowId, versionId);
            throw new EntityNotFoundException(
                    String.format("Artifact for workflow id %s version id %s was not found", workflowId, versionId));
        }
        return artifactOptional.get();
    }

    @Override
    public void deleteArtifact(String workflowId, String versionId) {
        validateWorkflowStatus(workflowId);
        WorkflowVersion retrievedVersion = get(workflowId, versionId);
        if (CERTIFIED.equals(retrievedVersion.getState())) {
            LOGGER.error("Workflow Version is certified and can not be edited.Workflow id {} and version id {}",
                    workflowId, versionId);
            throw new VersionModificationException(workflowId, versionId);
        }

        artifactRepository.delete(workflowId, versionId);
        versioningManager.publish(workflowId, new Version(versionId), "Delete Artifact");
    }

    private void validateVersionExistAndCertified(String workflowId, List<Version> versions, String versionId) {
        Version baseVersion = findVersion(versions, versionId).orElseThrow(
                () -> new EntityNotFoundException(String.format(VERSION_NOT_EXIST_MSG, versionId, workflowId)));

        if (CERTIFIED != versionStateMapper.versionStatusToWorkflowVersionState(baseVersion.getStatus())) {
            throw new VersionCreationException(workflowId, versionId, "base version must be CERTIFIED");
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
            LOGGER.error(String.format(
                    "Workflow Version was not found.Workflow id %s and version id %s", workflowId,
                    versionId),e);
            throw new EntityNotFoundException(String.format(VERSION_NOT_EXIST_MSG, versionId, workflowId));
        }
    }

    private void updateParameters(String workflowId, String versionId, Collection<ParameterEntity> inputs,
            Collection<ParameterEntity> outputs) {
        updateVersionParameters(workflowId, versionId, ParameterRole.INPUT, inputs);
        updateVersionParameters(workflowId, versionId, ParameterRole.OUTPUT, outputs);
    }

    private void updateVersionParameters(String workflowId, String versionId, ParameterRole role,
            Collection<ParameterEntity> parameters) {

        Collection<ParameterEntity> retrievedParams = parameterRepository.list(workflowId, versionId, role);
        Map<String, ParameterEntity> retrievedParamsByName =
                retrievedParams.stream().collect(Collectors.toMap(ParameterEntity::getName, Function.identity()));

        Set<String> namesOfParamsToKeep = new HashSet<>();
        for (ParameterEntity parameter : parameters) {

            ParameterEntity retrievedParam = retrievedParamsByName.get(parameter.getName());
            if (retrievedParam == null) {
                parameterRepository.create(workflowId, versionId, role, parameter);
            } else {
                parameter.setId(retrievedParam.getId());
                parameterRepository.update(workflowId, versionId, role, parameter);
                namesOfParamsToKeep.add(parameter.getName());
            }
        }

        retrievedParams.stream().filter(retrievedParam -> !namesOfParamsToKeep.contains(retrievedParam.getName()))
                       .forEach(retrievedParam -> parameterRepository
                                                          .delete(workflowId, versionId, retrievedParam.getId()));
    }

    private void loadAndAddParameters(String workflowId, WorkflowVersion workflowVersion) {
        workflowVersion.setInputs(parameterRepository.list(workflowId, workflowVersion.getId(), ParameterRole.INPUT));
        workflowVersion.setOutputs(parameterRepository.list(workflowId, workflowVersion.getId(), ParameterRole.OUTPUT));
    }

    private static Optional<Version> findVersion(List<Version> versions, String versionId) {
        return versions.stream().filter(version -> versionId.equals(version.getId())).findFirst();
    }

    void validateWorkflowStatus(String workflowId) {
        Item workflowItem = itemManager.get(workflowId);
        if (ItemStatus.ARCHIVED.equals(workflowItem.getStatus())) {
            throw new WorkflowModificationException(workflowId);
        }
    }

}