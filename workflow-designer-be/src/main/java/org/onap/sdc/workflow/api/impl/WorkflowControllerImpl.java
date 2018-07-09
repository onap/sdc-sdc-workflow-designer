package org.onap.sdc.workflow.api.impl;

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
import static org.onap.sdc.workflow.api.RestConstants.USER_ID_HEADER_PARAM;

import com.google.common.collect.ImmutableSet;

import java.util.Arrays;
import java.util.Objects;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.onap.sdc.workflow.api.WorkflowController;
import org.onap.sdc.workflow.api.exceptions.InvalidPaginationParameterException;
import org.onap.sdc.workflow.api.types.CollectionWrapper;
import org.onap.sdc.workflow.api.types.PaginationParameters;
import org.onap.sdc.workflow.api.types.PaginationParametersRequestDto;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController("workflowController")
public class WorkflowControllerImpl implements WorkflowController {

    private final WorkflowManager workflowManager;

    @Autowired
    public WorkflowControllerImpl(@Qualifier("workflowManager") WorkflowManager workflowManager) {
        this.workflowManager = workflowManager;
    }

    @Override
    public CollectionWrapper<Workflow> list(@RequestHeader(USER_ID_HEADER_PARAM) String user,
                                            PaginationParametersRequestDto paginationParametersRequestDto) {
        PaginationParameters paginationParameters = validatePaginationParameters(paginationParametersRequestDto);
        return new CollectionWrapper<>(workflowManager.list(paginationParameters));
    }

    @Override
    public ResponseEntity<?> create(@RequestBody Workflow workflow, @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        workflowManager.create(workflow);
        return new ResponseEntity<>(workflow, HttpStatus.CREATED);
    }

    @Override
    public Workflow get(@PathVariable("id") String id, @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        Workflow workflow = new Workflow();
        workflow.setId(id);
        return workflowManager.get(workflow);
    }

    @Override
    public Workflow update(@RequestBody Workflow workflow, @PathVariable("id") String id,
                           @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        workflow.setId(id);
        workflowManager.update(workflow);
        return workflow;
    }

    private PaginationParameters validatePaginationParameters(PaginationParametersRequestDto
                                                                      paginationParametersRequestDto) {
        PaginationParameters paginationParameters = new PaginationParameters();
        if (Objects.nonNull(paginationParametersRequestDto.getLimit())) {
            validateParameter(LIMIT_PARAM, paginationParametersRequestDto.getLimit(), LIMIT_MIN);
            paginationParameters.setLimit(Integer.parseInt(paginationParametersRequestDto.getLimit()));
        }

        if (Objects.nonNull(paginationParametersRequestDto.getOffset())) {
            validateParameter(OFFSET_PARAM, paginationParametersRequestDto.getOffset(), OFFSET_MIN);
            paginationParameters.setOffset(Integer.parseInt(paginationParametersRequestDto.getOffset()));
        }

        if (StringUtils.isEmpty(paginationParametersRequestDto.getLimit())
                && StringUtils.isNotEmpty(paginationParametersRequestDto.getOffset())) {
            paginationParameters.setLimit(LIMIT_DEFAULT);
            paginationParameters.setOffset(Integer.parseInt(paginationParametersRequestDto.getOffset()));
        }

        if (StringUtils.isEmpty(paginationParametersRequestDto.getSort())) {
            paginationParameters.setSortField(SORT_FIELD_NAME);
            paginationParameters.setSortOrder(SORT_ORDER_ASC);
        } else {
            validateSort(paginationParametersRequestDto.getSort());
            paginationParameters.setSortField(paginationParametersRequestDto.getSort().split(SORT_VALUE_SEPARATOR)[0]);
            paginationParameters.setSortOrder(paginationParametersRequestDto.getSort().split(SORT_VALUE_SEPARATOR)[1]);
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
