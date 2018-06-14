package org.onap.sdc.workflow.services.impl.mappers;

import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.persistence.types.WorkflowProperty;
import org.openecomp.sdc.versioning.types.Item;

public class ItemToWorkflowMapper extends Mapper<Item, Workflow> {

    @Override
    public void map(Item source, Workflow target) {
        target.setId(source.getId());
        target.setName(source.getName());
        target.setDescription(source.getDescription());
        target.setCategory((String) source.getProperties().get(WorkflowProperty.CATEGORY));
    }
}
