package org.onap.sdc.workflow.services.types;

import lombok.Getter;

@Getter
public class Sort {

    private String property;
    private boolean ascendingOrder;

    public Sort(String property, boolean ascendingOrder) {
        this.property = property;
        this.ascendingOrder = ascendingOrder;
    }
}
