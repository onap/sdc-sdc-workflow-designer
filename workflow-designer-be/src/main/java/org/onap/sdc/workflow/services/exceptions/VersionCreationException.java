package org.onap.sdc.workflow.services.exceptions;

public class VersionCreationException extends RuntimeException {

    private static final String MSG = "Error creating a new version for workflow with id %s";
    private static final String MSG_WITH_BASE_ID = MSG + " based on version %s";

    public VersionCreationException(String workflowId, String baseVersionId) {
        super(String.format(MSG_WITH_BASE_ID, workflowId, baseVersionId));
    }

    public VersionCreationException(String workflowId) {
        super(String.format(MSG, workflowId));
    }
}
