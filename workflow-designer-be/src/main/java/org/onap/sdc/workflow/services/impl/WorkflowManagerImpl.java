package org.onap.sdc.workflow.services.impl;

import java.util.Collection;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.impl.mappers.WorkflowMapper;
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.types.Item;
import org.openecomp.sdc.versioning.types.ItemStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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

    @Autowired
    public WorkflowManagerImpl(ItemManager itemManager,
            @Qualifier("uniqueValueService") UniqueValueService uniqueValueService, WorkflowMapper workflowMapper) {
        this.itemManager = itemManager;
        this.uniqueValueService = uniqueValueService;
        this.workflowMapper = workflowMapper;
    }

    @Override
    public Collection<Workflow> list() {
        return itemManager.list(ITEM_PREDICATE).stream().map(workflowMapper::itemToWorkflow)
                          .collect(Collectors.toList());
    }

    @Override
    public Workflow get(Workflow workflow) {
        Item retrievedItem = itemManager.get(workflow.getId());
        if (retrievedItem == null) {
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
            throw new EntityNotFoundException(String.format(WORKFLOW_NOT_FOUND_ERROR_MSG, workflow.getId()));
        }

        uniqueValueService.updateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, retrievedItem.getName(), workflow.getName());

        Item item = workflowMapper.workflowToItem(workflow);
        item.setId(workflow.getId());
        item.setStatus(retrievedItem.getStatus());
        item.setVersionStatusCounters(retrievedItem.getVersionStatusCounters());
        itemManager.update(item);
    }
}
