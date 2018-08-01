package org.onap.sdc.workflow.api.types;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.Getter;
import org.onap.sdc.workflow.services.types.Sort;

@Getter
public class Sorting {

    private static final String SORTS_DELIMITER = ",";
    private static final String DIRECTION_DELIMITER = ":";
    private static final String ASCENDING_ORDER = "asc";

    private List<Sort> sorts = Collections.emptyList();

    public void setSort(String sortString) {
        this.sorts = Arrays.stream(sortString.split(SORTS_DELIMITER)).map(this::formatSort).filter(Objects::nonNull)
                           .collect(Collectors.toList());
    }

    private Sort formatSort(String sort) {
        String[] tokens = sort.split(DIRECTION_DELIMITER);
        try {
            return new Sort(tokens[0], ASCENDING_ORDER.equalsIgnoreCase(tokens[1]));
        } catch (Exception e) {
            return null;
        }
    }
}
