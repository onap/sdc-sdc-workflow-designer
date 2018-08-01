package org.onap.sdc.workflow.services.types;

import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Singular;

@Builder
@Getter
public class SortingRequest {

    @Singular
    private List<Sort> sorts;
}
