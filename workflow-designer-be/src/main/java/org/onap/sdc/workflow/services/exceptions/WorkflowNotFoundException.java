package org.onap.sdc.workflow.services.exceptions;

public class WorkflowNotFoundException extends RuntimeException {

    public WorkflowNotFoundException(String workflowId) {
        super(String.format("Workflow with id '%s' does not exist", workflowId));
    }
}
