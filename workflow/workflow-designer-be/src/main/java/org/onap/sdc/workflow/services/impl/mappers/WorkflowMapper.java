package org.onap.sdc.workflow.services.impl.mappers;

import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.services.impl.WorkflowManagerImpl;
import org.openecomp.sdc.versioning.types.Item;

@Mapper(componentModel = "spring", imports = WorkflowManagerImpl.class, uses = VersionStateMapper.class)
public interface WorkflowMapper {

    @Mapping(source = "versionStatusCounters", target = "versionStates")
    Workflow itemToWorkflow(Item item);

    @InheritInverseConfiguration
    @Mappings({@Mapping(expression = "java(WorkflowManagerImpl.WORKFLOW_TYPE)", target = "type"),
            @Mapping(target = "versionStatusCounters", ignore = true)})
    Item workflowToItem(Workflow workflow);

}
