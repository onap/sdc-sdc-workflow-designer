package org.onap.sdc.workflow.services.mappers;

import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.ValueMapping;
import org.mapstruct.ValueMappings;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionStatus;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;

@Mapper(componentModel = "spring")
public interface VersionStatusMapper {

    @ValueMappings({@ValueMapping(source = "Certified", target = "CERTIFIED"),
            @ValueMapping(source = "Draft", target = "DRAFT"),
            @ValueMapping(source = "<ANY_REMAINING>", target = "DRAFT")})
    WorkflowVersionStatus versionStatusToWorkflowVersionStatus(VersionStatus status);

    @InheritInverseConfiguration
    VersionStatus workflowVersionStatusToVersionStatus(WorkflowVersionStatus status);


}
