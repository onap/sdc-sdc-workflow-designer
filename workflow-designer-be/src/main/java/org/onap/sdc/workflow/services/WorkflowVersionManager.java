package org.onap.sdc.workflow.services;

import java.util.Collection;
import org.onap.sdc.workflow.api.types.VersionRequestDto;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.springframework.web.multipart.MultipartFile;

public interface WorkflowVersionManager {

    Collection<WorkflowVersion> list(String workflowId);

    WorkflowVersion get(String workflowId,String versionId);

    WorkflowVersion create(String workflowId,  VersionRequestDto versionRequest);

    void update(String id,WorkflowVersion version);

    void uploadArtifact(String workflowId,WorkflowVersion version, MultipartFile artifact);

    ArtifactEntity getArtifact(String workflowId,WorkflowVersion version);

}
