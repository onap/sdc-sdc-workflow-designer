package org.onap.sdc.workflow.api.types;

import java.util.Collection;
import lombok.Data;

@Data
public class CollectionWrapper<T> {

    private int total;
    private int limit;
    private int offset;
    private Collection<T> results;

    public CollectionWrapper(Collection<T> results) {
        this.results = results;
        this.total = results.size();
    }
}
