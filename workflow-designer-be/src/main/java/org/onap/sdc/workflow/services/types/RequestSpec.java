package org.onap.sdc.workflow.services.types;

import lombok.Data;

@Data
public class RequestSpec {

    private PagingRequest paging;
    private SortingRequest sorting;

    public RequestSpec(PagingRequest paging, SortingRequest sorting) {
        this.paging = paging;
        this.sorting = sorting;
    }
}
