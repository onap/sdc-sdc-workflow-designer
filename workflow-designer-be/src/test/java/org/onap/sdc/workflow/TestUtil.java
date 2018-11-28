package org.onap.sdc.workflow;

import static org.onap.sdc.workflow.services.impl.ItemType.WORKFLOW;

import org.onap.sdc.workflow.services.types.Workflow;
import org.onap.sdc.workflow.services.types.WorkflowStatus;
import org.openecomp.sdc.versioning.types.Item;
import org.openecomp.sdc.versioning.types.ItemStatus;

public class TestUtil {

    public static Workflow createWorkflow(int workflowNum, boolean createId, WorkflowStatus archivingStatus) {
        Workflow workflow = new Workflow();
        if (createId) {
            workflow.setId(String.valueOf(workflowNum));
        }
        workflow.setName("Workflow_" + workflowNum);
        workflow.setDescription("Description_" + workflowNum);
        workflow.setArchiving(archivingStatus);

        return workflow;
    }

    public static Item createItem(int itemNum, boolean setType, boolean setId, ItemStatus archivingStatus) {
        Item item = new Item();
        if (setId) {
            item.setId(String.valueOf(itemNum));
        }
        item.setName("Workflow_" + itemNum);
        item.setDescription("Description_" + itemNum);
        if (setType) {
            item.setType(WORKFLOW.name());
        }
        item.setStatus(archivingStatus);
        return item;
    }


}
