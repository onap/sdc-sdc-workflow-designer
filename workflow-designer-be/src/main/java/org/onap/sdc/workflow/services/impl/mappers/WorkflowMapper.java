package org.onap.sdc.workflow.services.impl.mappers;

import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.services.impl.WorkflowManagerImpl;
import org.openecomp.sdc.versioning.types.Item;

@Mapper(componentModel = "spring", imports = WorkflowManagerImpl.class)
public interface WorkflowMapper {

    Workflow itemToWorkflow(Item item);

    @InheritInverseConfiguration
    @Mapping(expression = "java(WorkflowManagerImpl.WORKFLOW_TYPE)", target = "type")
    Item workflowToItem(Workflow workflow);

}
