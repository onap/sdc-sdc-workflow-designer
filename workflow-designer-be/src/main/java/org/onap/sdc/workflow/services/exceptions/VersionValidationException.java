package org.onap.sdc.workflow.services.exceptions;

public class VersionValidationException extends RuntimeException{

    private static final String MSG = "Error creating or modifying version for workflow with id %s: %s";

    public VersionValidationException(String workflowId, String detailedMessage) {
        super(String.format(MSG, workflowId, detailedMessage));
    }
}
