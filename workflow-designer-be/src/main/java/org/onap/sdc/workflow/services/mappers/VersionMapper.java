package org.onap.sdc.workflow.services.mappers;

import java.util.Collections;
import java.util.Map;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.onap.sdc.workflow.persistence.types.WorkflowProperty;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionStatus;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;

@Mapper(componentModel = "spring", uses = VersionStatusMapper.class)
public interface VersionMapper {


    WorkflowVersion versionToWorkflowVersion(Version version);

    @InheritInverseConfiguration
    Version workflowVersionToVersion(WorkflowVersion workflowVersion);

}
