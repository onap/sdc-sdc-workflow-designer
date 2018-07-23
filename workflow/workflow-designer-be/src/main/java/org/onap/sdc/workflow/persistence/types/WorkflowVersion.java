package org.onap.sdc.workflow.persistence.types;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import lombok.Data;


@Data
public class WorkflowVersion {

    private String id;
    private String name;
    private String description;
    private String baseId;
    private WorkflowVersionState state;
    private Collection<ParameterEntity> inputs = Collections.emptyList();
    private Collection<ParameterEntity> outputs = Collections.emptyList();
    private Date creationTime;
    private Date modificationTime;


    public WorkflowVersion(String id) {
        this.id = id;
        this.state = WorkflowVersionState.DRAFT;
    }

    public WorkflowVersion() {
    }
}
