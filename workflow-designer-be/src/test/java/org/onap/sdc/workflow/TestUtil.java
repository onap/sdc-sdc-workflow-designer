package org.onap.sdc.workflow;

import org.onap.sdc.workflow.persistence.types.Workflow;

public class TestUtil {

    public static Workflow createWorkflow(int workflowPropertySuffix, boolean createId) {
        Workflow workflow = new Workflow();
        if (createId) {
            workflow.setId("workflowId" + workflowPropertySuffix);
        }
        workflow.setName("workflowName" + workflowPropertySuffix);
        workflow.setDescription("workflowDesc" + workflowPropertySuffix);

        return workflow;
    }



}
