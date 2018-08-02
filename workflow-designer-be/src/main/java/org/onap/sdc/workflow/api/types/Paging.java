package org.onap.sdc.workflow.api.types;

import static org.onap.sdc.workflow.services.types.PagingConstants.MAX_LIMIT;

import java.util.Optional;
import lombok.Getter;

@Getter
public class Paging {

    private Integer offset;
    private Integer limit;

    public void setOffset(String offset) {
        getIntValue(offset).ifPresent(integer -> this.offset = integer);
    }

    public void setLimit(String limit) {
        getIntValue(limit).map(integer -> integer > MAX_LIMIT ? MAX_LIMIT : integer).ifPresent(integer -> {
            if (integer != 0) {
                this.limit = integer;
            }
        });
    }

    private static Optional<Integer> getIntValue(String value) {
        try {
            int intValue = Integer.parseInt(value);
            return intValue < 0 ? Optional.empty() : Optional.of(intValue);
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
