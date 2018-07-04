package org.onap.sdc.workflow.services.exceptions;

public class InvalidArtifactException extends RuntimeException  {

    public InvalidArtifactException(String message) {
        super("Invalid artifact file can not be processed. Error: " + message);
    }
}
