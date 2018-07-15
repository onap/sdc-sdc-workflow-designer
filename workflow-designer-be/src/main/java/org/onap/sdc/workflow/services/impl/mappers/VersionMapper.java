package org.onap.sdc.workflow.services.impl.mappers;

import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.openecomp.sdc.versioning.dao.types.Version;

@Mapper(componentModel = "spring", uses = VersionStateMapper.class)
public interface VersionMapper {


    @Mapping(source = "status", target = "state")
    WorkflowVersion versionToWorkflowVersion(Version version);

    @InheritInverseConfiguration
    Version workflowVersionToVersion(WorkflowVersion workflowVersion);

}
