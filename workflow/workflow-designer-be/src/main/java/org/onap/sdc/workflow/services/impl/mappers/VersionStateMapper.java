package org.onap.sdc.workflow.services.impl.mappers;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.ValueMapping;
import org.mapstruct.ValueMappings;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;

@Mapper(componentModel = "spring")
public interface VersionStateMapper {

    @ValueMappings({@ValueMapping(source = "Certified", target = "CERTIFIED"),
            @ValueMapping(source = "Draft", target = "DRAFT"),
            @ValueMapping(source = "<ANY_REMAINING>", target = "DRAFT")})
    WorkflowVersionState versionStatusToWorkflowVersionState(VersionStatus status);

    @InheritInverseConfiguration
    VersionStatus workflowVersionStateToVersionStatus(WorkflowVersionState status);

    default Set<WorkflowVersionState> versionStatusCountersToWorkflowVersionStates(
            Map<VersionStatus, Integer> versionStatusCounters) {
        return versionStatusCounters.keySet().stream().map(this::versionStatusToWorkflowVersionState)
                                    .collect(Collectors.toSet());
    }


}
