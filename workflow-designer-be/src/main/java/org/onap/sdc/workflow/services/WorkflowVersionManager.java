package org.onap.sdc.workflow.services;

import java.util.Collection;
import org.onap.sdc.workflow.api.types.VersionRequestDto;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.springframework.web.multipart.MultipartFile;

public interface WorkflowVersionManager {

    Collection<WorkflowVersion> list(String id);

    WorkflowVersion get(String id,WorkflowVersion version);

    WorkflowVersion create(String id,  VersionRequestDto versionRequest);

    void update(String id,WorkflowVersion version);

    void uploadArtifact(String id,WorkflowVersion version, MultipartFile artifact);

    ArtifactEntity getArtifact(String id,WorkflowVersion version);

}
