package org.onap.sdc.workflow.api.types;

import java.util.Collection;
import lombok.Data;

@Data
public class CollectionWrapper<T> {

    private int total;
    private int limit;
    private int offset;
    private Collection<T> results;


    public CollectionWrapper() {
        //Default constructor for object mappers
    }

    public CollectionWrapper(int limit, int offset, Collection<T> results) {
        this.results = results;
        this.limit = limit;
        this.offset = offset;
        this.total = results.size();
    }

    public CollectionWrapper(Collection<T> results) {
        this.results = results;
        this.total = results.size();
    }
}
