package org.onap.sdc.workflow.services;

import java.util.Collection;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface WorkflowVersionManager {

    Collection<Version> list(String id);

    Version get(String id, Version version);

    Version create(String id, Version version);

    void update(String id,Version version);

    void updateArtifact(String id,Version version, MultipartFile artifact);

    Resource getArtifactData(String id,Version version);

    String getArtifactFileName(String id,Version version);

}
