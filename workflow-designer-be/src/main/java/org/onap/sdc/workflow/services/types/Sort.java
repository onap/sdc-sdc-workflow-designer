package org.onap.sdc.workflow.services.types;

import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode
public class Sort {

    private String property;
    private boolean ascendingOrder;

    public Sort(String property, boolean ascendingOrder) {
        this.property = property;
        this.ascendingOrder = ascendingOrder;
    }
}
