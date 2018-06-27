package org.onap.sdc.workflow.services.exceptions;

public class VersionNotFoundException extends RuntimeException {

    public VersionNotFoundException(String workflowId, String versioId) {
        super(String.format("version with id '%s' does not exist for workflow with id %s",versioId,workflowId));
    }
}
