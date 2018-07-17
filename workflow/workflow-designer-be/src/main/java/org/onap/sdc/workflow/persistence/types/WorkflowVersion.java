package org.onap.sdc.workflow.persistence.types;

import java.util.Collection;
import java.util.Date;
import lombok.Data;


@Data
public class WorkflowVersion {

    private String id;
    private String name;
    private String description;
    private String baseId;
    private Date creationTime;
    private Date modificationTime;
    private WorkflowVersionState state;
    private Collection<ParameterEntity> inputs;
    private Collection<ParameterEntity> outputs;


    public WorkflowVersion(String id) {
        this.id = id;
        this.state = WorkflowVersionState.DRAFT;
    }

    public WorkflowVersion() {
    }
}
