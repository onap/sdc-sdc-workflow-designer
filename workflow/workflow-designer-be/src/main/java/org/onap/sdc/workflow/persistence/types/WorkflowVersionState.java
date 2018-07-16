package org.onap.sdc.workflow.persistence.types;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public enum WorkflowVersionState {

    CERTIFIED, DRAFT(CERTIFIED);

    private final List<WorkflowVersionState> nextStates;

    WorkflowVersionState(WorkflowVersionState... nextStates) {
        this.nextStates = Collections.unmodifiableList(Arrays.asList(nextStates));
    }

    public List<WorkflowVersionState> getNextStates() {
        return nextStates;
    }
}
