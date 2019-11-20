/*
 * Copyright © 2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onap.sdc.workflow.services.impl;

import static org.onap.sdc.workflow.services.impl.ItemType.WORKFLOW;
import static org.onap.sdc.workflow.services.types.PagingConstants.DEFAULT_LIMIT;
import static org.onap.sdc.workflow.services.types.PagingConstants.DEFAULT_OFFSET;
import static org.onap.sdc.workflow.services.types.PagingConstants.MAX_LIMIT;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.onap.sdc.common.versioning.services.ItemManager;
import org.onap.sdc.common.versioning.services.types.Item;
import org.onap.sdc.common.versioning.services.types.ItemStatus;
import org.onap.sdc.common.versioning.services.types.VersionStatus;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.WorkflowModificationException;
import org.onap.sdc.workflow.services.impl.mappers.ArchivingStatusMapper;
import org.onap.sdc.workflow.services.impl.mappers.VersionStateMapper;
import org.onap.sdc.workflow.services.impl.mappers.WorkflowMapper;
import org.onap.sdc.workflow.services.types.ArchivingStatus;
import org.onap.sdc.workflow.services.types.Page;
import org.onap.sdc.workflow.services.types.PagingRequest;
import org.onap.sdc.workflow.services.types.RequestSpec;
import org.onap.sdc.workflow.services.types.Sort;
import org.onap.sdc.workflow.services.types.SortingRequest;
import org.onap.sdc.workflow.services.types.Workflow;
import org.onap.sdc.workflow.services.types.WorkflowVersionState;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service("workflowManager")
public class WorkflowManagerImpl implements WorkflowManager {

    private static final String WORKFLOW_NOT_FOUND_ERROR_MSG = "Workflow with id '%s' does not exist";
    private static final String WORKFLOW_NAME_UNIQUE_TYPE = "WORKFLOW_NAME";
    private static final Predicate<Item> WORKFLOW_ITEM_TYPE_FILTER = item -> WORKFLOW.name().equals(item.getType());
    private static final String WORKSPACES_SORT_PROPERTY = "name";
    private static final RequestSpec WORKSPACES_DEFAULT_REQUEST_SPEC =
            new RequestSpec(new PagingRequest(DEFAULT_OFFSET, DEFAULT_LIMIT),
                    SortingRequest.builder().sort(new Sort(WORKSPACES_SORT_PROPERTY, true)).build());

    private static final Logger LOGGER = LoggerFactory.getLogger(WorkflowManagerImpl.class);

    private final ItemManager itemManager;
    private final UniqueValueService uniqueValueService;
    private final WorkflowMapper workflowMapper;
    private final ArchivingStatusMapper archivingStatusMapper;
    private final VersionStateMapper versionStateMapper;

    @Autowired
    public WorkflowManagerImpl(ItemManager itemManager,
            @Qualifier("uniqueValueService") UniqueValueService uniqueValueService, WorkflowMapper workflowMapper,
            ArchivingStatusMapper archivingStatusMapper, VersionStateMapper versionStateMapper) {
        this.itemManager = itemManager;
        this.uniqueValueService = uniqueValueService;
        this.workflowMapper = workflowMapper;
        this.archivingStatusMapper = archivingStatusMapper;
        this.versionStateMapper = versionStateMapper;
    }

    @Override
    public Page<Workflow> list(String statusFilter, String searchNameFilter,
            Set<WorkflowVersionState> versionStatesFilter, RequestSpec requestSpec) {
        requestSpec = getRequestSpec(requestSpec);

        Collection<Item> workflowItems =
                itemManager.list(createFilter(statusFilter, searchNameFilter, versionStatesFilter));

        List<Workflow> workflowsSlice = workflowItems.stream().map(workflowMapper::fromItem)
                                                .sorted(getWorkflowComparator(requestSpec.getSorting()))
                                                .skip(requestSpec.getPaging().getOffset())
                                                .limit(requestSpec.getPaging().getLimit()).collect(Collectors.toList());

        return new Page<>(workflowsSlice, requestSpec.getPaging(), workflowItems.size());
    }

    @Override
    public Workflow get(Workflow workflow) {
        Item retrievedItem = itemManager.get(workflow.getId());
        if (retrievedItem == null) {
            throw new EntityNotFoundException(String.format(WORKFLOW_NOT_FOUND_ERROR_MSG, workflow.getId()));
        }
        return this.workflowMapper.fromItem(retrievedItem);
    }

    @Override
    public Workflow create(Workflow workflow) {
        Item item = new Item();
        workflowMapper.toItem(workflow, item);

        uniqueValueService.validateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, workflow.getName());
        Item createdItem = itemManager.create(item);
        uniqueValueService.createUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, workflow.getName());

        return workflowMapper.fromItem(createdItem);
    }

    @Override
    public void update(Workflow workflow) {
        Item item = itemManager.get(workflow.getId());
        if (item == null) {
            throw new EntityNotFoundException(String.format(WORKFLOW_NOT_FOUND_ERROR_MSG, workflow.getId()));
        }

        if (ItemStatus.ARCHIVED.equals(item.getStatus())) {
            throw new WorkflowModificationException(workflow.getId());
        }

        uniqueValueService.updateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, item.getName(), workflow.getName());

        workflowMapper.toItem(workflow, item);
        itemManager.update(workflow.getId(), item);
    }

    @Override
    public void updateStatus(String workflowId, ArchivingStatus status) {
        itemManager.updateStatus(workflowId, archivingStatusMapper.toItemStatus(status));
    }

    private static RequestSpec getRequestSpec(RequestSpec requestSpec) {
        if (requestSpec == null) {
            return WORKSPACES_DEFAULT_REQUEST_SPEC;
        }
        if (requestSpec.getPaging() == null) {
            requestSpec.setPaging(WORKSPACES_DEFAULT_REQUEST_SPEC.getPaging());
        } else {
            handlePagingRequestValues(requestSpec.getPaging());
        }
        if (requestSpec.getSorting() == null) {
            requestSpec.setSorting(WORKSPACES_DEFAULT_REQUEST_SPEC.getSorting());
        }
        return requestSpec;
    }

    private static void handlePagingRequestValues(PagingRequest paging) {
        if (paging.getOffset() == null) {
            paging.setOffset(DEFAULT_OFFSET);
        }
        if (paging.getLimit() == null) {
            paging.setLimit(DEFAULT_LIMIT);
        } else if (paging.getLimit() > MAX_LIMIT) {
            paging.setLimit(MAX_LIMIT);
        }
    }

    private static Comparator<Workflow> getWorkflowComparator(SortingRequest sorting) {
        Boolean byNameAscending = sorting.getSorts().stream()
                                          .filter(sort -> WORKSPACES_SORT_PROPERTY.equalsIgnoreCase(sort.getProperty()))
                                          .findFirst().map(Sort::isAscendingOrder).orElse(true);
        Comparator<Workflow> byName = Comparator.comparing(Workflow::getName);

        return byNameAscending ? byName : byName.reversed();
    }

    private Predicate<Item> createFilter(String itemStatusFilter, String searchNameFilter,
            Set<WorkflowVersionState> versionStatesFilter) {

        Set<VersionStatus> versionStatusesFilter = versionStatesFilter == null ? null :
                                                           versionStatesFilter.stream()
                                                           .map(versionStateMapper::workflowVersionStateToVersionStatus)
                                                           .collect(Collectors.toSet());

        Predicate<Item> filter = addSearchNameFilter(WORKFLOW_ITEM_TYPE_FILTER, searchNameFilter);

        filter = addVersionStatusFilter(filter, versionStatusesFilter);

        return addItemStatusFilter(filter, itemStatusFilter);

    }

    private static Predicate<Item> addSearchNameFilter(Predicate<Item> filter, String searchNameFilter) {
        return filter.and(item -> searchNameFilter == null || item.getName().toLowerCase()
                                                                      .contains(searchNameFilter.toLowerCase()));
    }

    private static Predicate<Item> addVersionStatusFilter(Predicate<Item> filter, Set<VersionStatus> versionStatuses) {
        return filter.and(item -> versionStatuses == null || item.getVersionStatusCounters().keySet().stream()
                                                                     .anyMatch(versionStatuses::contains));
    }

    private static Predicate<Item> addItemStatusFilter(Predicate<Item> filter, String itemStatusFilter) {
        if (itemStatusFilter != null) {
            try {
                ItemStatus.valueOf(itemStatusFilter.toUpperCase());
            } catch (IllegalArgumentException e) {
                LOGGER.debug("Illegal Workflow status filter: {}. Ignoring filter", itemStatusFilter, e);
                return filter;
            }
            return filter.and(item -> item.getStatus().equals(ItemStatus.valueOf(itemStatusFilter.toUpperCase())));
        }
        return filter;
    }
}
