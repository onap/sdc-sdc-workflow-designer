package org.onap.sdc.workflow.services.impl;

import java.util.Collection;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.services.mappers.WorkflowMapper;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.exceptions.WorkflowNotFoundException;
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.types.Item;
import org.openecomp.sdc.versioning.types.ItemStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service("workflowManager")
public class WorkflowManagerImpl implements WorkflowManager {

    private static final String WORKFLOW_TYPE = "WORKFLOW";
    private static final String WORKFLOW_NAME_UNIQUE_TYPE = "WORKFLOW_NAME";
    private final ItemManager itemManager;
    private final UniqueValueService uniqueValueService;
    private WorkflowMapper workflowMapper;

    @Autowired
    public WorkflowManagerImpl(ItemManager itemManager,
            @Qualifier("uniqueValueService") UniqueValueService uniqueValueService, WorkflowMapper workflowMapper) {
        this.itemManager = itemManager;
        this.uniqueValueService = uniqueValueService;
        this.workflowMapper = workflowMapper;
    }

    @Override
    public Collection<Workflow> list() {
        return itemManager.list(item -> WORKFLOW_TYPE.equals(item.getType())).stream()
                          .map(item -> workflowMapper.itemToWorkflow(item)).collect(Collectors.toList());
    }

    @Override
    public Workflow get(Workflow workflow) {
        Item retrievedItem = itemManager.get(workflow.getId());
        if (retrievedItem == null) {
            throw new WorkflowNotFoundException(workflow.getId());
        }
        return this.workflowMapper.itemToWorkflow(retrievedItem);
    }

    @Override
    public void create(Workflow workflow) {
        Item item = workflowMapper.workflowToItem(workflow);
        item.setStatus(ItemStatus.ACTIVE);

        uniqueValueService.validateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, new String[]{workflow.getName()});
        workflow.setId(itemManager.create(item).getId());
        uniqueValueService.createUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, new String[]{workflow.getName()});
    }

    @Override
    public void update(Workflow workflow) {
        Item retrievedItem = itemManager.get(workflow.getId());
        if (retrievedItem == null) {
            throw new WorkflowNotFoundException(workflow.getId());
        }

        uniqueValueService.updateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, retrievedItem.getName(), workflow.getName());

        Item item = workflowMapper.workflowToItem(workflow);
        item.setId(workflow.getId());
        item.setStatus(retrievedItem.getStatus());
        item.setVersionStatusCounters(retrievedItem.getVersionStatusCounters());

        itemManager.update(item);
    }
}
