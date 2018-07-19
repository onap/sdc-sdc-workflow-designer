package org.onap.sdc.workflow.api.types;

import java.util.Collection;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CollectionWrapper<T> {

    private int total;
    private int size;
    private int page;
    private Collection<T> results;

    public CollectionWrapper(int size, int page, Collection<T> results) {
        this.results = results;
        this.size = size;
        this.page = page;
        this.total = results.size();
    }

    public CollectionWrapper(Collection<T> results) {
        this.results = results;
        this.total = results.size();
    }
}
