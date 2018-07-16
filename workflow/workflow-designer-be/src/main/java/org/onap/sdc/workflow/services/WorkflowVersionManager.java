package org.onap.sdc.workflow.services;

import java.util.Collection;
import org.onap.sdc.workflow.api.types.VersionRequestDto;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.springframework.web.multipart.MultipartFile;


public interface WorkflowVersionManager {

    Collection<WorkflowVersion> list(String workflowId);

    WorkflowVersion create(String workflowId, VersionRequestDto versionRequest);

    void update(String id, WorkflowVersion version);

    WorkflowVersion get(String workflowId, String versionId);

    WorkflowVersionState getState(String workflowId, String versionId);

    void updateState(String workflowId, String versionId, WorkflowVersionState state);

    ArtifactEntity getArtifact(String workflowId, String versionId);

    void deleteArtifact(String workflowId, String versionId);

    void uploadArtifact(String workflowId, String versionId, MultipartFile artifact);
}