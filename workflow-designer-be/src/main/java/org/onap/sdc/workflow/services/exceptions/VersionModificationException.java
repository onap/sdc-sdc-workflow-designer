package org.onap.sdc.workflow.services.exceptions;

public class VersionModificationException extends RuntimeException {

    public VersionModificationException(String workflowId, String version) {
        super(String.format("Error while trying to modify version for workflow id %s. "
                                    + "Version %s is Certified and can not be edited", workflowId, version));
    }
}
