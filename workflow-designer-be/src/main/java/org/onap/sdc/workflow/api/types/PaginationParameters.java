package org.onap.sdc.workflow.api.types;

import lombok.Data;

@Data
public class PaginationParameters {

    private String sortField;
    private String sortOrder;
    private int limit;
    private int offset;

}
