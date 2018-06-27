package org.onap.sdc.workflow.services.mappers;

import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.openecomp.sdc.versioning.types.Item;

@Mapper(componentModel = "spring")
public interface WorkflowMapper {

    Workflow itemToWorkflow(Item item);


    @InheritInverseConfiguration
    Item workflowToItem(Workflow workflow);

}
