package org.onap.sdc.workflow.services.impl.mappers;

import static org.onap.sdc.workflow.services.impl.WorkflowManagerImpl.WORKFLOW_TYPE;

import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.persistence.types.WorkflowProperty;
import org.openecomp.sdc.versioning.types.Item;

public class WorkflowToItemMapper extends Mapper<Workflow, Item> {

    @Override
    public void map(Workflow source, Item target) {
        target.setType(WORKFLOW_TYPE);
        target.setName(source.getName());
        target.setDescription(source.getDescription());
        target.addProperty(WorkflowProperty.CATEGORY, source.getCategory());
    }
}
