package org.onap.sdc.workflow;

import static org.onap.sdc.workflow.services.impl.ItemType.WORKFLOW;

import org.onap.sdc.workflow.services.types.Workflow;
import org.openecomp.sdc.versioning.types.Item;

public class TestUtil {

    public static Workflow createWorkflow(int workflowNum, boolean createId) {
        Workflow workflow = new Workflow();
        if (createId) {
            workflow.setId(String.valueOf(workflowNum));
        }
        workflow.setName("Workflow_" + workflowNum);
        workflow.setDescription("Description_" + workflowNum);

        return workflow;
    }

    public static Item createItem(int itemNum, boolean setType, boolean setId) {
        Item item = new Item();
        if (setId) {
            item.setId(String.valueOf(itemNum));
        }
        item.setName("Workflow_" + itemNum);
        item.setDescription("Description_" + itemNum);
        if (setType) {
            item.setType(WORKFLOW.name());
        }
        return item;
    }


}
