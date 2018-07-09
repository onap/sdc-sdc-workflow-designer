package org.onap.sdc.workflow.api.types;

import static org.onap.sdc.workflow.api.RestConstants.LIMIT_DEFAULT;
import static org.onap.sdc.workflow.api.RestConstants.LIMIT_MIN;
import static org.onap.sdc.workflow.api.RestConstants.LIMIT_PARAM;
import static org.onap.sdc.workflow.api.RestConstants.OFFSET_MIN;
import static org.onap.sdc.workflow.api.RestConstants.OFFSET_PARAM;
import static org.onap.sdc.workflow.api.RestConstants.SORT_FIELD_NAME;
import static org.onap.sdc.workflow.api.RestConstants.SORT_ORDER_ASC;
import static org.onap.sdc.workflow.api.RestConstants.SORT_ORDER_DESC;
import static org.onap.sdc.workflow.api.RestConstants.SORT_ORDER_PARAM;
import static org.onap.sdc.workflow.api.RestConstants.SORT_PARAM;
import static org.onap.sdc.workflow.api.RestConstants.SORT_VALUE_SEPARATOR;

import com.google.common.collect.ImmutableSet;

import java.util.Arrays;
import java.util.Objects;
import java.util.Set;

import lombok.Data;
import org.apache.commons.lang.StringUtils;
import org.onap.sdc.workflow.api.exceptions.InvalidPaginationParameterException;

@Data
public class PaginationParametersRequestDto {

    private String sort;
    private String limit;
    private String offset;

    public PaginationParameters validatePaginationParameters() {
        PaginationParameters paginationParameters = new PaginationParameters();
        if (Objects.nonNull(this.getLimit())) {
            validateParameter(LIMIT_PARAM, this.getLimit(), LIMIT_MIN);
            paginationParameters.setLimit(Integer.parseInt(this.getLimit()));
        }

        if (Objects.nonNull(this.getOffset())) {
            validateParameter(OFFSET_PARAM, this.getOffset(), OFFSET_MIN);
            paginationParameters.setOffset(Integer.parseInt(this.getOffset()));
        }

        if (StringUtils.isEmpty(this.getLimit())
                && StringUtils.isNotEmpty(this.getOffset())) {
            paginationParameters.setLimit(LIMIT_DEFAULT);
            paginationParameters.setOffset(Integer.parseInt(this.getOffset()));
        }

        if (StringUtils.isEmpty(this.getSort())) {
            paginationParameters.setSortField(SORT_FIELD_NAME);
            paginationParameters.setSortOrder(SORT_ORDER_ASC);
        } else {
            validateSort(this.getSort());
            paginationParameters.setSortField(this.getSort().split(SORT_VALUE_SEPARATOR)[0]);
            paginationParameters.setSortOrder(this.getSort().split(SORT_VALUE_SEPARATOR)[1]);
        }
        return paginationParameters;
    }

    private void validateParameter(String parameterName, String parameterValue, int parameterMin) {
        boolean isParameterValid = false;
        Integer paramValueInteger = isIntegerParameter(parameterValue);
        if (Objects.nonNull(paramValueInteger) && paramValueInteger >= parameterMin) {
            isParameterValid = true;
        }
        if (!isParameterValid) {
            throw new InvalidPaginationParameterException(parameterName, parameterValue, "must be a positive integer");
        }
    }

    private void validateSort(String sortParameterValue) {
        boolean isSortParameterValid = false;
        String[] sortValueArr = sortParameterValue.split(":");
        if (sortValueArr.length >= 2) {
            String fieldName = sortValueArr[0];
            String sortOrder = sortValueArr[1];
            if (isValidSortField(fieldName) && isValidSortOrderVal(sortOrder)) {
                isSortParameterValid = true;
            }
        }
        if (!isSortParameterValid) {
            throw new InvalidPaginationParameterException(SORT_PARAM, sortParameterValue,
                    "must be of form <field_name>:<order>");
        }
    }

    private Integer isIntegerParameter(String parameterValue) {
        Integer value;
        try {
            value = Integer.parseInt(parameterValue);
        } catch (NumberFormatException nfe) {
            value = null;
        }
        return value;
    }

    private boolean isValidSortField(String sortFieldName) {
        Set<String> validSortFields = ImmutableSet.of(SORT_FIELD_NAME);
        if (validSortFields.contains(sortFieldName.toLowerCase())) {
            return true;
        }
        throw new InvalidPaginationParameterException(SORT_PARAM, sortFieldName,
                "is not supported. Supported values are: " + Arrays.toString(validSortFields.toArray()));
    }

    private boolean isValidSortOrderVal(String sortOrderValue) {
        Set<String> validSortOrderValues = ImmutableSet.of(SORT_ORDER_ASC, SORT_ORDER_DESC);
        if (validSortOrderValues.contains(sortOrderValue.toLowerCase())) {
            return true;
        }
        throw new InvalidPaginationParameterException(SORT_ORDER_PARAM, sortOrderValue,
                "is not supported. Supported values are: " + Arrays.toString(validSortOrderValues.toArray()));
    }
}
