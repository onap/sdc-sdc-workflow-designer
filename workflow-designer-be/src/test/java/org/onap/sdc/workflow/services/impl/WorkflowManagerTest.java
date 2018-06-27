package org.onap.sdc.workflow.services.impl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.TestUtil.createWorkflow;

import java.util.Arrays;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.exceptions.WorkflowNotFoundException;
import org.onap.sdc.workflow.services.mappers.WorkflowMapper;
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.types.Item;
import org.openecomp.sdc.versioning.types.ItemStatus;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
public class WorkflowManagerTest {

    private static final String ITEM1_ID = "workflowId1";
    private static final String ITEM2_ID = "workflowId2";
    private static final String WORKFLOW_TYPE = "WORKFLOW";
    private static final String WORKFLOW_NAME_UNIQUE_TYPE = "WORKFLOW_NAME";
    private List<Item> itemList;

    @Mock
    WorkflowMapper workflowMapperMock;

    @Mock
    private ItemManager itemManagerMock;

    @Mock
    private UniqueValueService uniqueValueServiceMock;

    @InjectMocks
    private WorkflowManagerImpl workflowManager;



    @Before
    public void setUp(){
        itemList = Arrays.asList(createItem(1,true,true),
                createItem(2,true,true),createItem(3,true,true));

    }


    @Test
    public void shouldReturnWorkflowVersionList(){

        doReturn(itemList).when(itemManagerMock).list(workflowManager.ITEM_PREDICATE);
        workflowManager.list();
        verify(itemManagerMock).list(workflowManager.ITEM_PREDICATE);
    }

    @Test(expected = WorkflowNotFoundException.class)
    public void shouldThrowExceptionWhenWorkflowDontExist(){
        Workflow nonExistingWorkflow = new Workflow();
        nonExistingWorkflow.setId(ITEM1_ID);
        doReturn(null).when(itemManagerMock).get(ITEM1_ID);
        workflowManager.get(nonExistingWorkflow);
        verify(workflowMapperMock,times(3)).itemToWorkflow(any(Item.class));
    }

    @Test
    public void shouldReturnWorkflow(){
        Item retrievedItem = createItem(1,true,true);
        doReturn(retrievedItem).when(itemManagerMock).get(ITEM1_ID);
        Workflow workflow = createWorkflow(1,true);
        workflowManager.get(workflow);
        verify(itemManagerMock).get(ITEM1_ID);
        verify(workflowMapperMock).itemToWorkflow(retrievedItem);


    }

    @Test
    public void shouldCreateWorkflow() {
        Workflow workflowToBeCreated = createWorkflow(1, false);
        Item createdWorkflowItem = createItem(1, false, true);
        doReturn(createdWorkflowItem).when(workflowMapperMock).workflowToItem(workflowToBeCreated);
        doReturn(createdWorkflowItem).when(itemManagerMock).create(createdWorkflowItem);
        workflowManager.create(workflowToBeCreated);
        verify(uniqueValueServiceMock)
                .validateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, new String[] {workflowToBeCreated.getName()});

        createdWorkflowItem.setStatus(ItemStatus.ACTIVE);
        createdWorkflowItem.setType(WORKFLOW_TYPE);
        verify(itemManagerMock).create(createdWorkflowItem);
        verify(uniqueValueServiceMock)
                .createUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, new String[] {workflowToBeCreated.getName()});
    }

    @Test
    public void shouldUpdateWorkflow(){
        Item workflowItem = createItem(1, true, true);
        doReturn(workflowItem).when(itemManagerMock).get(ITEM1_ID);
        Workflow workflowToBeUpdated = createWorkflow(1, true);
        doReturn(workflowItem).when(workflowMapperMock).workflowToItem(workflowToBeUpdated);
        workflowManager.update(workflowToBeUpdated);
        verify(itemManagerMock).update(workflowItem);
        verify(uniqueValueServiceMock)
                .updateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE,workflowItem.getName(),workflowToBeUpdated.getName());

    }

    @Test(expected = WorkflowNotFoundException.class)
    public void shouldThrowExceptionWhenWorkflowToUpdateNotFound(){
        doReturn(null).when(itemManagerMock).get(ITEM1_ID);
        workflowManager.update(createWorkflow(1, true));
    }


    private Item createItem(int itemNum,boolean setType, boolean setId){
        Item item = new Item();
        if(setId) {
            item.setId("workflowId" + itemNum);
        }
        item.addProperty("category","category_" + itemNum);
        item.setName("Workflow_" + itemNum);
        item.setDescription("Description_" + itemNum);
        if(setType) {
            item.setType(WORKFLOW_TYPE);
        }

        return item;
    }

}
