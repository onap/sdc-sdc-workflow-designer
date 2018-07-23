package org.onap.sdc.workflow.services.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.TestUtil.createItem;
import static org.onap.sdc.workflow.TestUtil.createWorkflow;
import static org.onap.sdc.workflow.api.RestConstants.SORT_FIELD_NAME;
import static org.openecomp.sdc.versioning.dao.types.VersionStatus.Certified;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
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
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.types.Item;
import org.openecomp.sdc.versioning.types.ItemStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
public class WorkflowManagerImplTest {

    private static final String ITEM1_ID = "1";
    private static final String WORKFLOW_TYPE = "WORKFLOW";
    private static final String WORKFLOW_NAME_UNIQUE_TYPE = "WORKFLOW_NAME";
    private static final List<Item> ITEMS;
    private static final List<Workflow> MAPPED_WORKFLOWS;

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
        Collection<Workflow> workflows =
                workflowManager.list(null, createPageRequest(20, 0, Sort.Direction.ASC, SORT_FIELD_NAME));

        Map<String, Workflow> workflowById =
                workflows.stream().collect(Collectors.toMap(Workflow::getId, Function.identity()));
        assertEquals(ITEMS.size(), workflows.size());
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

        Collection<Workflow> workflows = workflowManager.list(Collections.singleton(WorkflowVersionState.CERTIFIED),
                createPageRequest(20, 0, Sort.Direction.ASC, SORT_FIELD_NAME));

        Map<String, Workflow> workflowById =
                workflows.stream().collect(Collectors.toMap(Workflow::getId, Function.identity()));
        assertEquals(2, workflows.size());
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
        PageRequest pageRequest = createPageRequest(5, 0, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(5, workflowManager.list(null, pageRequest).size());
    }

    @Test
    public void shouldListLimitFilteredWorkflowsInFirstOffsetRange() {
        PageRequest pageRequest = createPageRequest(3, 0, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(3, workflowManager.list(null, pageRequest).size());
    }

    @Test
    public void shouldListLimitFilteredWorkflowsInSecondOffsetRange() {
        PageRequest pageRequest = createPageRequest(3, 1, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(2, workflowManager.list(null, pageRequest).size());
    }

    @Test
    public void shouldListAllWorkflowsWhenLimitGreaterThanTotalRecordsAndOffsetInRange() {
        PageRequest pageRequest = createPageRequest(10, 0, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(5, workflowManager.list(null, pageRequest).size());
    }

    @Test
    public void shouldNotListWorkflowsIfOffsetGreaterThanTotalRecords() {
        PageRequest pageRequest = createPageRequest(3, 6, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(0, workflowManager.list(null, pageRequest).size());
    }

    @Test
    public void shouldNotListWorkflowsBothLimitAndOffsetGreaterThanTotalRecords() {
        PageRequest pageRequest = createPageRequest(10, 10, Sort.Direction.ASC, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Assert.assertEquals(0, workflowManager.list(null, pageRequest).size());
    }

    @Test
    public void shouldListLimitOffsetAppliedWorkflowsSortedInDescOrder() {
        PageRequest pageRequest = createPageRequest(2, 1, Sort.Direction.DESC, SORT_FIELD_NAME);
        doReturn(ITEMS).when(itemManagerMock).list(any());
        for (int i = 0; i < ITEMS.size(); i++) {
            doReturn(MAPPED_WORKFLOWS.get(i)).when(workflowMapperMock).itemToWorkflow(ITEMS.get(i));
        }
        Collection<Workflow> workflows = workflowManager.list(null, pageRequest);
        Assert.assertEquals(2, workflows.size());
        Iterator<Workflow> workflowIterator = workflows.iterator();
        Assert.assertEquals("Workflow_3", workflowIterator.next().getName());
        Assert.assertEquals("Workflow_2", workflowIterator.next().getName());
    }

    private PageRequest createPageRequest(int limit, int offset, Sort.Direction sortOrder, String sortField) {
        return PageRequest.of(offset, limit, sortOrder, sortField);
    }

}