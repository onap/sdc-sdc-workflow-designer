package org.onap.sdc.workflow.services;

import java.util.Comparator;

import org.onap.sdc.workflow.persistence.types.Workflow;

public class WorkflowNameComparator implements Comparator<Workflow>{

    @Override
    public int compare(Workflow workflow1, Workflow workflow2) {
        String workflowName1 = workflow1.getName().toLowerCase();
        String workflowName2 = workflow2.getName().toLowerCase();
        //ascending order
        return workflowName1.compareTo(workflowName2);
    }
}
