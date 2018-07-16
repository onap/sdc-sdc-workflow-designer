package org.onap.sdc.workflow.services.exceptions;

public class VersionModificationException extends RuntimeException {

    public VersionModificationException(String workflowId, String versionId) {
        super(String.format(
            "Error while trying to modify version %s of workflow %s: Version is CERTIFIED and can not be edited",
            versionId, workflowId));
    }
}