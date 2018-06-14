package org.onap.sdc.workflow.services.impl;

import java.util.Collection;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.errors.WorkflowNotFoundException;
import org.onap.sdc.workflow.services.impl.mappers.ItemToWorkflowMapper;
import org.onap.sdc.workflow.services.impl.mappers.WorkflowToItemMapper;
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.types.Item;
import org.openecomp.sdc.versioning.types.ItemStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service("workflowManager")
public class WorkflowManagerImpl implements WorkflowManager {

    public static final String WORKFLOW_TYPE = "WORKFLOW";
    private static final String WORKFLOW_NAME_UNIQUE_TYPE = "WORKFLOW_NAME";
    private final ItemManager itemManager;
    private final UniqueValueService uniqueValueService;

    @Autowired
    public WorkflowManagerImpl(ItemManager itemManager,
            @Qualifier("uniqueValueService") UniqueValueService uniqueValueService) {
        this.itemManager = itemManager;
        this.uniqueValueService = uniqueValueService;
    }

    @Override
    public Collection<Workflow> list() {
        ItemToWorkflowMapper mapper = new ItemToWorkflowMapper();
        return itemManager.list(item -> WORKFLOW_TYPE.equals(item.getType())).stream()
                          .map(item -> mapper.applyMapping(item, Workflow.class)).collect(Collectors.toList());
    }

    @Override
    public Workflow get(Workflow workflow) {
        ItemToWorkflowMapper mapper = new ItemToWorkflowMapper();
        Item retrievedItem = itemManager.get(workflow.getId());
        if (retrievedItem == null) {
            throw new WorkflowNotFoundException(workflow.getId());
        }
        return mapper.applyMapping(retrievedItem, Workflow.class);
    }

    @Override
    public void create(Workflow workflow) {
        Item item = new WorkflowToItemMapper().applyMapping(workflow, Item.class);
        item.setStatus(ItemStatus.ACTIVE);

        uniqueValueService.validateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, workflow.getName());
        workflow.setId(itemManager.create(item).getId());
        uniqueValueService.createUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, workflow.getName());
    }

    @Override
    public void update(Workflow workflow) {
        Item retrievedItem = itemManager.get(workflow.getId());
        if (retrievedItem == null) {
            throw new WorkflowNotFoundException(workflow.getId());
        }

        uniqueValueService.updateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, retrievedItem.getName(), workflow.getName());

        Item item = new WorkflowToItemMapper().applyMapping(workflow, Item.class);
        item.setId(workflow.getId());
        item.setStatus(retrievedItem.getStatus());
        item.setVersionStatusCounters(retrievedItem.getVersionStatusCounters());

        itemManager.update(item);
    }
}
