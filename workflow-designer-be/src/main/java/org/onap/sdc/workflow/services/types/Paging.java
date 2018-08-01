package org.onap.sdc.workflow.services.types;

import lombok.Getter;

@Getter
public class Paging {

    private int offset;
    private int limit;
    private int count;
    private boolean hasMore;
    private int total;

    public Paging(PagingRequest pagingRequest, int count, int total) {
        this.offset = pagingRequest.getOffset();
        this.limit = pagingRequest.getLimit();
        this.count = count;
        setTotal(total);
    }

    private void setTotal(int total) {
        this.total = total;
        this.hasMore = total > offset + limit;
    }
}
