package org.onap.sdc.workflow.services.errors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(NOT_FOUND)
public class WorkflowNotFoundException extends RuntimeException {

    public WorkflowNotFoundException(String workflowId) {
        super(String.format("Workflow with id %s does not exist", workflowId));
    }
}
