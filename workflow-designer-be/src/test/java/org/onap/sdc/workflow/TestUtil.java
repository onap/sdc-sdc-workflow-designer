package org.onap.sdc.workflow;

import org.onap.sdc.workflow.persistence.types.Workflow;
import org.openecomp.sdc.versioning.types.Item;

public class TestUtil {

    private static final String WORKFLOW_TYPE = "WORKFLOW";

    public static Workflow createWorkflow(int workflowPropertySuffix, boolean createId) {
        Workflow workflow = new Workflow();
        if (createId) {
            workflow.setId("workflowId" + workflowPropertySuffix);
        }
        workflow.setName("workflowName" + workflowPropertySuffix);
        workflow.setDescription("workflowDesc" + workflowPropertySuffix);

        return workflow;
    }

    public static Item createItem(int itemNum,boolean setType, boolean setId){
        Item item = new Item();
        if(setId) {
            item.setId("workflowId" + itemNum);
        }
        item.addProperty("category","category_" + itemNum);
        item.setName("Workflow_" + itemNum);
        item.setDescription("Description_" + itemNum);
        if(setType) {
            item.setType(WORKFLOW_TYPE);
        }

        return item;
    }



}
