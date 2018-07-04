package org.onap.sdc.workflow.services.exceptions;

public class VersioningErrorException extends RuntimeException  {

    public VersioningErrorException(String workflowId, String version) {
        super(String.format("Error creating new version for workflow with id %s. There is already a draft version %s",
                workflowId, version));
    }
}
