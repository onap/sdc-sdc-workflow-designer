package org.onap.sdc.workflow.persistence.types;


import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class Workflow {

    private String id;
    @NotNull
    private String name;
    private String description;
}
