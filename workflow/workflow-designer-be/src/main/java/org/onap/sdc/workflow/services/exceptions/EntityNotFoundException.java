package org.onap.sdc.workflow.services.exceptions;

public class EntityNotFoundException extends RuntimeException  {

    public EntityNotFoundException(String message) {
        super(message);
    }
}
