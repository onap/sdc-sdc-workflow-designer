package org.onap.sdc.workflow.api.types;

import java.util.List;
import lombok.Data;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;

@Data
public class VersionStateDto {

    private WorkflowVersionState name;
    private List<WorkflowVersionState> nextStates;

    public VersionStateDto() {
    }

    public VersionStateDto(WorkflowVersionState state) {
        name = state;
        nextStates = state.getNextStates();
    }
}
