package org.onap.sdc.workflow.api.types;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UnexpectedErrorResponse extends ErrorResponse {

    private String devInfo;

    public UnexpectedErrorResponse(String message) {
        super(message);
    }
}
