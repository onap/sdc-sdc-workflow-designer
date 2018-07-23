package org.onap.sdc.workflow.persistence.types;


import java.util.Collection;
import java.util.Set;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class Workflow {

    private String id;
    @NotNull
    private String name;
    private String description;
    private Set<WorkflowVersionState> versionStates;
    private Collection<WorkflowVersion> versions;
}
