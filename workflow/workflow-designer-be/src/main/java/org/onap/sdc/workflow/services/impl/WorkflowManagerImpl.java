package org.onap.sdc.workflow.services.impl;

import static org.onap.sdc.workflow.api.RestConstants.SORT_FIELD_NAME;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.WorkflowNameComparator;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.impl.mappers.WorkflowMapper;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.types.Item;
import org.openecomp.sdc.versioning.types.ItemStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service("workflowManager")
public class WorkflowManagerImpl implements WorkflowManager {

    public static final String WORKFLOW_TYPE = "WORKFLOW";
    private static final String WORKFLOW_NOT_FOUND_ERROR_MSG = "Workflow with id '%s' does not exist";
    private static final String WORKFLOW_NAME_UNIQUE_TYPE = "WORKFLOW_NAME";
    static final Predicate<Item> ITEM_PREDICATE = item -> WORKFLOW_TYPE.equals(item.getType());

    private final ItemManager itemManager;
    private final UniqueValueService uniqueValueService;
    private final WorkflowMapper workflowMapper;
    private static final Logger LOGGER = LoggerFactory.getLogger(WorkflowManagerImpl.class);

    @Autowired
    public WorkflowManagerImpl(ItemManager itemManager,
            @Qualifier("uniqueValueService") UniqueValueService uniqueValueService, WorkflowMapper workflowMapper) {
        this.itemManager = itemManager;
        this.uniqueValueService = uniqueValueService;
        this.workflowMapper = workflowMapper;
    }

    @Override
    public Collection<Workflow> list(Pageable pageRequest) {
        List<Workflow> workflowList = itemManager.list(ITEM_PREDICATE).stream()
                .map( workflowMapper::itemToWorkflow).collect(Collectors.toList());
        sortWorkflowList(workflowList, pageRequest);
        return applyLimitAndOffset(workflowList, pageRequest);
    }

    @Override
    public Workflow get(Workflow workflow) {
        Item retrievedItem = itemManager.get(workflow.getId());
        if (retrievedItem == null) {
            LOGGER.error(String.format("Workflow with id %s was not found",workflow.getId()));
            throw new EntityNotFoundException(String.format(WORKFLOW_NOT_FOUND_ERROR_MSG, workflow.getId()));
        }
        return this.workflowMapper.itemToWorkflow(retrievedItem);
    }

    @Override
    public Workflow create(Workflow workflow) {
        Item item = workflowMapper.workflowToItem(workflow);
        item.setStatus(ItemStatus.ACTIVE);

        uniqueValueService.validateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, new String[] {workflow.getName()});
        workflow.setId(itemManager.create(item).getId());
        uniqueValueService.createUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, new String[] {workflow.getName()});
        return workflow;
    }

    @Override
    public void update(Workflow workflow) {
        Item retrievedItem = itemManager.get(workflow.getId());
        if (retrievedItem == null) {
            LOGGER.error(String.format("Workflow with id %s was not found",workflow.getId()));
            throw new EntityNotFoundException(String.format(WORKFLOW_NOT_FOUND_ERROR_MSG, workflow.getId()));
        }

        uniqueValueService.updateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, retrievedItem.getName(), workflow.getName());

        Item item = workflowMapper.workflowToItem(workflow);
        item.setId(workflow.getId());
        item.setStatus(retrievedItem.getStatus());
        item.setVersionStatusCounters(retrievedItem.getVersionStatusCounters());
        itemManager.update(item);
    }

    private List<Workflow> applyLimitAndOffset(List<Workflow> workflowList, Pageable pageRequest) {
        int limit = pageRequest.getPageSize();
        int offset = pageRequest.getPageNumber();
        int totalNumOfWorkflows = workflowList.size();
        List<Workflow> selectedWorkflows;
        try {
            if (limit > totalNumOfWorkflows) {
                limit = totalNumOfWorkflows;
            }
            int startIndex = offset * limit;
            int endIndex = startIndex + limit;
            if (endIndex > totalNumOfWorkflows) {
                endIndex = totalNumOfWorkflows;
            }
            selectedWorkflows = workflowList.subList(startIndex, endIndex);
        } catch (IndexOutOfBoundsException | IllegalArgumentException ex) {
            selectedWorkflows = new ArrayList<>();
        }
        return selectedWorkflows;
    }

    private void sortWorkflowList(List<Workflow> workflowList, Pageable pageRequest) {
        Comparator<Workflow> comparator = getWorkflowListComparator();
        if (pageRequest.getSort().getOrderFor(SORT_FIELD_NAME).getDirection() == Sort.Direction.ASC) {
            workflowList.sort(comparator);
        } else {
            workflowList.sort(Collections.reverseOrder(comparator));
        }
    }

    private Comparator<Workflow> getWorkflowListComparator() {
        //More comparators can be added if required based on sort field name
        return new WorkflowNameComparator();
    }
}
