package org.onap.sdc.workflow.api.types;

import lombok.Data;

@Data
public class PaginationParametersRequestDto {

    private String sort;
    private String limit;
    private String offset;

}
