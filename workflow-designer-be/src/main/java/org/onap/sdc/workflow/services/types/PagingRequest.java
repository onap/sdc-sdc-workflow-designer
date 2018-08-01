package org.onap.sdc.workflow.services.types;

import lombok.Data;

@Data
public class PagingRequest {

    private int offset;
    private int limit;

    public PagingRequest(int offset, int limit) {
        this.offset = offset;
        this.limit = limit;
    }
}
