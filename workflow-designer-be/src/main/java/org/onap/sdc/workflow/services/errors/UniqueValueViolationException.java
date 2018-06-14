package org.onap.sdc.workflow.services.errors;


import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(UNPROCESSABLE_ENTITY)
public class UniqueValueViolationException extends RuntimeException {

    private static final String UNIQUE_VALUE_VIOLATION_MSG = "%s with the value '%s' already exists.";

    public UniqueValueViolationException(String uniqueType, String value) {
        super(String.format(UNIQUE_VALUE_VIOLATION_MSG, uniqueType, value));
    }
}
