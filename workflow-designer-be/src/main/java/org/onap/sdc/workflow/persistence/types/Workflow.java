package org.onap.sdc.workflow.persistence.types;


import java.util.Comparator;

import lombok.Data;

@Data
public class Workflow {

    private String id;
    private String name;
    private String description;

    public static final Comparator<Workflow> workflowNameComparator  = (workflow1, workflow2) -> {
        String workflowName1 = workflow1.getName().toLowerCase();
        String workflowName2 = workflow2.getName().toLowerCase();
        //ascending order
        return workflowName1.compareTo(workflowName2);
    };
}
