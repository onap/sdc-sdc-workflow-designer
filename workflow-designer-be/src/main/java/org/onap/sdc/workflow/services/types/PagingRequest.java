package org.onap.sdc.workflow.services.types;

import lombok.Getter;

@Getter
public class PagingRequest {

    private Integer offset;
    private Integer limit;

    public PagingRequest(int offset, int limit) {
        setOffset(offset);
        setLimit(limit);
    }

    public void setOffset(int offset) {
        this.offset = offset < 0 ? null : offset;
    }

    public void setLimit(int limit) {
        this.limit = limit <= 0 ? null : limit;
    }
}
