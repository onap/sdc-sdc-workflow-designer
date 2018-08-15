package org.onap.sdc.workflow.api.types;

import lombok.Getter;

@Getter
public class UnexpectedErrorResponse extends ErrorResponse {

    private String devInfo;

    public UnexpectedErrorResponse(String message) {
        super(message);
    }

    public UnexpectedErrorResponse(String message, String devInfo) {
        super(message);
        this.devInfo = devInfo;
    }
}
