package org.onap.sdc.workflow.api.types;

import java.util.Collection;
import lombok.Data;

@Data
public class CollectionResponse<T> {

    private int total;
    private Collection<T> items;

    public CollectionResponse(Collection<T> items) {
        this.items = items;
        this.total = items.size();
    }
}
