package org.onap.sdc.workflow.services.impl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.TestUtil.createItem;
import static org.onap.sdc.workflow.TestUtil.createWorkflow;
import static org.onap.sdc.workflow.api.RestConstants.SORT_FIELD_NAME;

import java.util.Arrays;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.impl.mappers.WorkflowMapper;
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.types.Item;
import org.openecomp.sdc.versioning.types.ItemStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
public class WorkflowManagerImplTest {

    private static final String ITEM1_ID = "workflowId1";
    private static final String WORKFLOW_TYPE = "WORKFLOW";
    private static final String WORKFLOW_NAME_UNIQUE_TYPE = "WORKFLOW_NAME";
    private List<Item> itemList;
    private List<Workflow> workflowList;

    @Mock
    private WorkflowMapper workflowMapperMock;

    @Mock
    private ItemManager itemManagerMock;

    @Mock
    private UniqueValueService uniqueValueServiceMock;

    @InjectMocks
    private WorkflowManagerImpl workflowManager;


    @Before
    public void setUp() {
        itemList = Arrays.asList(createItem(1, true, true), createItem(2, true, true), createItem(3, true, true),
                createItem(4, true, true), createItem(5, true, true));
        workflowList = Arrays.asList(createWorkflow(1, true), createWorkflow(2, true), createWorkflow(3, true),
                createWorkflow(4, true), createWorkflow(5, true));
    }


    @Test
    public void shouldReturnWorkflowVersionList() {
        PageRequest pageRequest = createPageRequest(2, 1, Sort.Direction.DESC, SORT_FIELD_NAME);
        doReturn(itemList).when(itemManagerMock).list(WorkflowManagerImpl.ITEM_PREDICATE);
        for (int i=0; i<itemList.size(); i++) {
            doReturn(workflowList.get(i)).when(workflowMapperMock).itemToWorkflow(itemList.get(i));
        }
        workflowManager.list(pageRequest);
        verify(itemManagerMock).list(WorkflowManagerImpl.ITEM_PREDICATE);
    }

    @Test(expected = EntityNotFoundException.class)
    public void shouldThrowExceptionWhenWorkflowDontExist() {
        Workflow nonExistingWorkflow = new Workflow();
        nonExistingWorkflow.setId(ITEM1_ID);
        doReturn(null).when(itemManagerMock).get(ITEM1_ID);
        workflowManager.get(nonExistingWorkflow);
        verify(workflowMapperMock, times(3)).itemToWorkflow(any(Item.class));
    }

    @Test
    public void shouldReturnWorkflow() {
        Item retrievedItem = createItem(1, true, true);
        doReturn(retrievedItem).when(itemManagerMock).get(ITEM1_ID);
        Workflow workflow = createWorkflow(1, true);
        workflowManager.get(workflow);
        verify(itemManagerMock).get(ITEM1_ID);
        verify(workflowMapperMock).itemToWorkflow(retrievedItem);


    }

    @Test
    public void shouldCreateWorkflowItemFromWorkflow() {
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
    public void shouldUpdateWorkflow() {
        Item workflowItem = createItem(1, true, true);
        doReturn(workflowItem).when(itemManagerMock).get(ITEM1_ID);
        Workflow workflowToBeUpdated = createWorkflow(1, true);
        doReturn(workflowItem).when(workflowMapperMock).workflowToItem(workflowToBeUpdated);
        workflowManager.update(workflowToBeUpdated);
        verify(itemManagerMock).update(workflowItem);
        verify(uniqueValueServiceMock)
                .updateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, workflowItem.getName(), workflowToBeUpdated.getName());

    }

    @Test(expected = EntityNotFoundException.class)
    public void shouldThrowExceptionWhenWorkflowToUpdateNotFound() {
        doReturn(null).when(itemManagerMock).get(ITEM1_ID);
        workflowManager.update(createWorkflow(1, true));
    }

    @Test
    public void shouldListAllWorkflowsWhenLimitAndOffsetAreValid() {
        PageRequest pageRequest = createPageRequest(5, 0, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(itemList).when(itemManagerMock).list(WorkflowManagerImpl.ITEM_PREDICATE);
        for (int i=0; i<itemList.size(); i++) {
            doReturn(workflowList.get(i)).when(workflowMapperMock).itemToWorkflow(itemList.get(i));
        }
        Assert.assertEquals(5, workflowManager.list(pageRequest).size());
    }

    @Test
    public void shouldListLimitFilteredWorkflowsInFirstOffsetRange() {
        PageRequest pageRequest = createPageRequest(3, 0, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(itemList).when(itemManagerMock).list(WorkflowManagerImpl.ITEM_PREDICATE);
        for (int i=0; i<itemList.size(); i++) {
            doReturn(workflowList.get(i)).when(workflowMapperMock).itemToWorkflow(itemList.get(i));
        }
        Assert.assertEquals(3, workflowManager.list(pageRequest).size());
    }

    @Test
    public void shouldListLimitFilteredWorkflowsInSecondOffsetRange() {
        PageRequest pageRequest = createPageRequest(3, 1, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(itemList).when(itemManagerMock).list(WorkflowManagerImpl.ITEM_PREDICATE);
        for (int i=0; i<itemList.size(); i++) {
            doReturn(workflowList.get(i)).when(workflowMapperMock).itemToWorkflow(itemList.get(i));
        }
        Assert.assertEquals(2, workflowManager.list(pageRequest).size());
    }

    @Test
    public void shouldListAllWorkflowsWhenLimitGreaterThanTotalRecordsAndOffsetInRange() {
        PageRequest pageRequest = createPageRequest(10, 0, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(itemList).when(itemManagerMock).list(WorkflowManagerImpl.ITEM_PREDICATE);
        for (int i=0; i<itemList.size(); i++) {
            doReturn(workflowList.get(i)).when(workflowMapperMock).itemToWorkflow(itemList.get(i));
        }
        Assert.assertEquals(5, workflowManager.list(pageRequest).size());
    }

    @Test
    public void shouldNotListWorkflowsIfOffsetGreaterThanTotalRecords() {
        PageRequest pageRequest = createPageRequest(3, 6, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(itemList).when(itemManagerMock).list(WorkflowManagerImpl.ITEM_PREDICATE);
        for (int i=0; i<itemList.size(); i++) {
            doReturn(workflowList.get(i)).when(workflowMapperMock).itemToWorkflow(itemList.get(i));
        }
        Assert.assertEquals(0, workflowManager.list(pageRequest).size());
    }

    @Test
    public void shouldNotListWorkflowsBothLimitAndOffsetGreaterThanTotalRecords() {
        PageRequest pageRequest = createPageRequest(10, 10, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(itemList).when(itemManagerMock).list(WorkflowManagerImpl.ITEM_PREDICATE);
        for (int i=0; i<itemList.size(); i++) {
            doReturn(workflowList.get(i)).when(workflowMapperMock).itemToWorkflow(itemList.get(i));
        }
        Assert.assertEquals(0, workflowManager.list(pageRequest).size());
    }

    @Test
    public void shouldListLimitOffsetAppliedWorkflowsSortedInDescOrder() {
        PageRequest pageRequest = createPageRequest(2, 1, Sort.Direction.DESC, SORT_FIELD_NAME);
        doReturn(itemList).when(itemManagerMock).list(WorkflowManagerImpl.ITEM_PREDICATE);
        for (int i=0; i<itemList.size(); i++) {
            doReturn(workflowList.get(i)).when(workflowMapperMock).itemToWorkflow(itemList.get(i));
        }
        Collection<Workflow> workflows = workflowManager.list(pageRequest);
        Assert.assertEquals(2, workflows.size());
        Iterator<Workflow> workflowIterator = workflows.iterator();
        Assert.assertEquals("workflowName3", workflowIterator.next().getName());
        Assert.assertEquals("workflowName2", workflowIterator.next().getName());
    }

    private PageRequest createPageRequest(int limit, int offset,
                                          Sort.Direction sortOrder, String sortField) {
        return PageRequest.of(offset, limit, sortOrder, sortField);
    }

}