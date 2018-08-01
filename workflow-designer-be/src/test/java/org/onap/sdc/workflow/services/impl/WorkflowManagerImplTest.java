package org.onap.sdc.workflow.services.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.TestUtil.createItem;
import static org.onap.sdc.workflow.TestUtil.createWorkflow;
import static org.openecomp.sdc.versioning.dao.types.VersionStatus.Certified;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.impl.mappers.VersionStateMapper;
import org.onap.sdc.workflow.services.impl.mappers.WorkflowMapper;
import org.onap.sdc.workflow.services.types.Page;
import org.onap.sdc.workflow.services.types.PagingRequest;
import org.onap.sdc.workflow.services.types.RequestSpec;
import org.onap.sdc.workflow.services.types.Sort;
import org.onap.sdc.workflow.services.types.SortingRequest;
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.types.Item;
import org.openecomp.sdc.versioning.types.ItemStatus;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
public class WorkflowManagerImplTest {


    private static final String ITEM1_ID = "1";
    private static final String WORKFLOW_TYPE = "WORKFLOW";
    private static final String WORKFLOW_NAME_UNIQUE_TYPE = "WORKFLOW_NAME";
    private static final List<Item> ITEMS;
    private static final List<Workflow> MAPPED_WORKFLOWS;
    private static final String SORT_FIELD_NAME = "name";

    static {
        List<Item> items = new ArrayList<>();
        List<Workflow> mappedWorkflows = new ArrayList<>();
        for (int i = 1; i < 6; i++) {
            items.add(createItem(i, true, true));
            mappedWorkflows.add(createWorkflow(i, true));
        }
        ITEMS = Collections.unmodifiableList(items);
        MAPPED_WORKFLOWS = Collections.unmodifiableList(mappedWorkflows);
    }

    @Mock
    private ItemManager itemManagerMock;
    @Mock
    private UniqueValueService uniqueValueServiceMock;
    @Mock
    private WorkflowMapper workflowMapperMock;
    @Mock
    private VersionStateMapper versionStateMapperMock;
    @InjectMocks
    private WorkflowManagerImpl workflowManager;

    @Test
    public void shouldReturnWorkflowVersionList() {
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Page<Workflow> workflows = workflowManager.list(null, createRequestSpec(20, 0, true, SORT_FIELD_NAME));

        Map<String, Workflow> workflowById =
                workflows.getItems().stream().collect(Collectors.toMap(Workflow::getId, Function.identity()));
        assertEquals(ITEMS.size(), workflows.getItems().size());
        for (int i = 1; i < ITEMS.size() + 1; i++) {
            assertTrue(workflowById.containsKey(String.valueOf(i)));
        }
    }

    @Test
    public void listWithVersionStateFilter() {
        doReturn(Certified).when(versionStateMapperMock)
                           .workflowVersionStateToVersionStatus(WorkflowVersionState.CERTIFIED);
        doReturn(Arrays.asList(ITEMS.get(0), ITEMS.get(2))).when(itemManagerMock).list(any());
        doReturn(MAPPED_WORKFLOWS.get(0)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(0));
        doReturn(MAPPED_WORKFLOWS.get(2)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(2));

        Page<Workflow> workflows = workflowManager.list(Collections.singleton(WorkflowVersionState.CERTIFIED),
                createRequestSpec(20, 0, true, SORT_FIELD_NAME));

        Map<String, Workflow> workflowById =
                workflows.getItems().stream().collect(Collectors.toMap(Workflow::getId, Function.identity()));
        assertEquals(2, workflows.getItems().size());
        assertTrue(workflowById.containsKey("1"));
        assertTrue(workflowById.containsKey("3"));
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
        RequestSpec requestSpec = createRequestSpec(5, 0, true, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(5, workflowManager.list(null, requestSpec).getItems().size());
    }

    @Test
    public void shouldListLimitFilteredWorkflowsInFirstOffsetRange() {
        RequestSpec requestSpec = createRequestSpec(3, 0, true, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(3, workflowManager.list(null, requestSpec).getItems().size());
    }

/*    @Test
    public void shouldListLimitFilteredWorkflowsInSecondOffsetRange() {
        RequestSpec requestSpec = createRequestSpec(3, 1, true, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(2, workflowManager.list(null, requestSpec).getItems().size());
    }*/

    @Test
    public void shouldListAllWorkflowsWhenLimitGreaterThanTotalRecordsAndOffsetInRange() {
        RequestSpec requestSpec = createRequestSpec(10, 0, true, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(5, workflowManager.list(null, requestSpec).getItems().size());
    }

    @Test
    public void shouldNotListWorkflowsIfOffsetGreaterThanTotalRecords() {
        RequestSpec requestSpec = createRequestSpec(3, 6, true, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(0, workflowManager.list(null, requestSpec).getItems().size());
    }

    @Test
    public void shouldNotListWorkflowsBothLimitAndOffsetGreaterThanTotalRecords() {
        RequestSpec requestSpec = createRequestSpec(10, 10, true, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(0, workflowManager.list(null, requestSpec).getItems().size());
    }

/*    @Test
    public void shouldListLimitOffsetAppliedWorkflowsSortedInDescOrder() {
        RequestSpec requestSpec = createRequestSpec(2, 1, false, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);
        Assert.assertEquals(2, workflows.getItems().size());
        Iterator<Workflow> workflowIterator = workflows.getItems().iterator();
        Assert.assertEquals("Workflow_3", workflowIterator.next().getName());
        Assert.assertEquals("Workflow_2", workflowIterator.next().getName());
    }*/

    private RequestSpec createRequestSpec(int limit, int offset, boolean isAscending, String sortField) {
        return new RequestSpec(new PagingRequest(offset, limit),
                SortingRequest.builder().sort(new Sort(sortField, isAscending)).build());
    }
}