package org.onap.sdc.workflow.services.exceptions;

import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;

public class VersionStateModificationException extends RuntimeException {

    public VersionStateModificationException(String workflowId, String versionId, WorkflowVersionState sourceState,
            WorkflowVersionState targetState) {
        super(String.format("Workflow %s, version %s: state can not be changed from %s to %s", workflowId, versionId,
                sourceState.name(), targetState.name()));
    }
}
