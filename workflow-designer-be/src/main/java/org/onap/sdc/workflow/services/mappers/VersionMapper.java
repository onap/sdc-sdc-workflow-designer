package org.onap.sdc.workflow.services.mappers;

import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.openecomp.sdc.versioning.dao.types.Version;

@Mapper(componentModel = "spring")
public interface VersionMapper {

    WorkflowVersion versionToWorkflowVersion(Version version);

    @InheritInverseConfiguration
    Version workflowVersionToVersion(WorkflowVersion workflowVersion);
}
