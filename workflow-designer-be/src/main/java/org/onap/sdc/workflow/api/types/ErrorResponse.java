package org.onap.sdc.workflow.api.types;

import lombok.Getter;

@Getter
public class ErrorResponse {

    private String message;

    public ErrorResponse(String message) {
        this.message = message;
    }
}
