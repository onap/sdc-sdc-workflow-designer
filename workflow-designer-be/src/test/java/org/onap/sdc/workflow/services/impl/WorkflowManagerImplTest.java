package org.onap.sdc.workflow.services.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.TestUtil.createItem;
import static org.onap.sdc.workflow.TestUtil.createWorkflow;
import static org.onap.sdc.workflow.services.types.PagingConstants.DEFAULT_LIMIT;
import static org.onap.sdc.workflow.services.types.PagingConstants.DEFAULT_OFFSET;
import static org.onap.sdc.workflow.services.types.PagingConstants.MAX_LIMIT;
import static org.openecomp.sdc.versioning.dao.types.VersionStatus.Certified;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
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
import org.onap.sdc.workflow.services.types.Paging;
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
        for (int i = 0; i < 5; i++) {
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
        mockItemToWorkflowMaps();
        RequestSpec requestSpec = createRequestSpec(0, 20, true);
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);

        Map<String, Workflow> workflowById =
                workflows.getItems().stream().collect(Collectors.toMap(Workflow::getId, Function.identity()));
        assertEquals(ITEMS.size(), workflows.getItems().size());
        for (int i = 0; i < ITEMS.size(); i++) {
            assertTrue(workflowById.containsKey(String.valueOf(i)));
        }
        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), requestSpec.getPaging().getLimit(),
                ITEMS.size());
    }

    @Test
    public void listWithVersionStateFilter() {
        doReturn(Certified).when(versionStateMapperMock)
                           .workflowVersionStateToVersionStatus(WorkflowVersionState.CERTIFIED);
        doReturn(Arrays.asList(ITEMS.get(0), ITEMS.get(2))).when(itemManagerMock).list(any());
        doReturn(MAPPED_WORKFLOWS.get(0)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(0));
        doReturn(MAPPED_WORKFLOWS.get(2)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(2));

        RequestSpec requestSpec = createRequestSpec(0, 20, true);
        Page<Workflow> workflows =
                workflowManager.list(Collections.singleton(WorkflowVersionState.CERTIFIED), requestSpec);

        Map<String, Workflow> workflowById =
                workflows.getItems().stream().collect(Collectors.toMap(Workflow::getId, Function.identity()));
        assertEquals(2, workflows.getItems().size());
        assertTrue(workflowById.containsKey("0"));
        assertTrue(workflowById.containsKey("2"));

        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), requestSpec.getPaging().getLimit(), 2);
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
    public void listWhenRequestSpecIsNull() {
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        Page<Workflow> workflows = workflowManager.list(null, null);

        assertEquals(ITEMS.size(), workflows.getItems().size());
        assertPaging(workflows.getPaging(), DEFAULT_OFFSET, DEFAULT_LIMIT, ITEMS.size());

        // verify sorted ascending by name
        for (int i = DEFAULT_OFFSET; i < ITEMS.size(); i++) {
            assertEquals("Workflow_" + i, workflows.getItems().get(i).getName());
        }
    }

    @Test
    public void listWhenPagingIsNull() {
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        Page<Workflow> workflows = workflowManager.list(null, new RequestSpec(null,
                SortingRequest.builder().sort(new Sort(SORT_FIELD_NAME, true)).build()));

        assertEquals(ITEMS.size(), workflows.getItems().size());
        assertPaging(workflows.getPaging(), DEFAULT_OFFSET, DEFAULT_LIMIT, ITEMS.size());
    }

    @Test
    public void listWhenOffsetAndLimitAreNull() {
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        RequestSpec requestSpec = new RequestSpec(new PagingRequest(-2, -8),
                SortingRequest.builder().sort(new Sort(SORT_FIELD_NAME, true)).build());
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);

        assertEquals(ITEMS.size(), workflows.getItems().size());
        assertPaging(workflows.getPaging(), DEFAULT_OFFSET, DEFAULT_LIMIT, ITEMS.size());
    }

    @Test
    public void listWhenSortingIsNull() {
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        RequestSpec requestSpec = new RequestSpec(new PagingRequest(2, 8), null);
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);

        assertEquals(3, workflows.getItems().size());
        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), requestSpec.getPaging().getLimit(),
                ITEMS.size());

        // verify sorted ascending by name
        assertEquals("Workflow_2", workflows.getItems().get(0).getName());
        assertEquals("Workflow_3", workflows.getItems().get(1).getName());
        assertEquals("Workflow_4", workflows.getItems().get(2).getName());
    }

    @Test
    public void listWhenSortingIsEmpty() {
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        RequestSpec requestSpec = new RequestSpec(new PagingRequest(2, 8), SortingRequest.builder().build());
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);

        assertEquals(3, workflows.getItems().size());
        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), requestSpec.getPaging().getLimit(),
                ITEMS.size());

        // verify sorted ascending by name
        assertEquals("Workflow_2", workflows.getItems().get(0).getName());
        assertEquals("Workflow_3", workflows.getItems().get(1).getName());
        assertEquals("Workflow_4", workflows.getItems().get(2).getName());
    }

    @Test
    public void listWhenRequestSpecIsValid() {
        RequestSpec requestSpec = createRequestSpec(0, 5, true);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);

        assertEquals(5, workflows.getItems().size());
        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), requestSpec.getPaging().getLimit(),
                ITEMS.size());
    }

    @Test
    public void listWhenLimitIsLessThanTotal() {
        RequestSpec requestSpec = createRequestSpec(0, 3, true);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);
        assertEquals(3, workflows.getItems().size());
        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), requestSpec.getPaging().getLimit(),
                ITEMS.size());
    }


    @Test
    public void listWhenOffsetIsNotFirst() {
        RequestSpec requestSpec = createRequestSpec(3, 1, true);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);
        assertEquals(1, workflows.getItems().size());
        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), requestSpec.getPaging().getLimit(),
                ITEMS.size());
    }

    @Test
    public void listWhenLimitIsMoreThanTotal() {
        RequestSpec requestSpec = createRequestSpec(0, 10, true);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);
        assertEquals(5, workflows.getItems().size());
        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), requestSpec.getPaging().getLimit(),
                ITEMS.size());
    }

    @Test
    public void listWhenOffsetIsMoreThanTotal() {
        RequestSpec requestSpec = createRequestSpec(6, 3, true);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);
        assertEquals(0, workflows.getItems().size());
        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), requestSpec.getPaging().getLimit(),
                ITEMS.size());
    }

    @Test
    public void listWhenOffsetIsMoreThanMax() {
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        RequestSpec requestSpec = createRequestSpec(0, 5555, true);
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);

        assertEquals(ITEMS.size(), workflows.getItems().size());
        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), MAX_LIMIT, ITEMS.size());
    }

    @Test
    public void listWhenOffsetAndLimitAreMoreThanTotal() {
        RequestSpec requestSpec = createRequestSpec(10, 10, true);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);
        assertEquals(0, workflows.getItems().size());
        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), requestSpec.getPaging().getLimit(),
                ITEMS.size());
    }

    @Test
    public void listWhenSortedDesc() {
        RequestSpec requestSpec = createRequestSpec(2, 1, false);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        mockItemToWorkflowMaps();
        Page<Workflow> workflows = workflowManager.list(null, requestSpec);
        assertEquals(1, workflows.getItems().size());
        assertPaging(workflows.getPaging(), requestSpec.getPaging().getOffset(), requestSpec.getPaging().getLimit(),
                ITEMS.size());
        Iterator<Workflow> workflowIterator = workflows.getItems().iterator();
        assertEquals("Workflow_2", workflowIterator.next().getName());
    }

    private void mockItemToWorkflowMaps() {
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
    }

    private static RequestSpec createRequestSpec(int offset, int limit, boolean isAscending) {
        return new RequestSpec(new PagingRequest(offset, limit),
                SortingRequest.builder().sort(new Sort(SORT_FIELD_NAME, isAscending)).build());
    }

    private static void assertPaging(Paging paging, int expectedOffset, int expectedLimit, int expectedTotal) {
        assertEquals(expectedOffset, paging.getOffset());
        assertEquals(expectedLimit, paging.getLimit());
        assertEquals(expectedTotal, paging.getTotal());
    }
}