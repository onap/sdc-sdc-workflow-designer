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

import static org.onap.sdc.workflow.services.types.PagingConstants.DEFAULT_LIMIT;
import static org.onap.sdc.workflow.services.types.PagingConstants.DEFAULT_OFFSET;
import static org.onap.sdc.workflow.services.types.PagingConstants.MAX_LIMIT;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.onap.sdc.workflow.services.UniqueValueService;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.impl.mappers.VersionStateMapper;
import org.onap.sdc.workflow.services.impl.mappers.WorkflowMapper;
import org.onap.sdc.workflow.services.types.Page;
import org.onap.sdc.workflow.services.types.PagingRequest;
import org.onap.sdc.workflow.services.types.RequestSpec;
import org.onap.sdc.workflow.services.types.Sort;
import org.onap.sdc.workflow.services.types.SortingRequest;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;
import org.openecomp.sdc.versioning.ItemManager;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;
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
    private static final Predicate<Item> WORKFLOW_ITEM_FILTER = item -> WORKFLOW_TYPE.equals(item.getType());
    private static final String WORKSPACES_SORT_PROPERTY = "name";
    private static final RequestSpec WORKSPACES_DEFAULT_REQUEST_SPEC =
            new RequestSpec(new PagingRequest(DEFAULT_OFFSET, DEFAULT_LIMIT),
                    SortingRequest.builder().sort(new Sort(WORKSPACES_SORT_PROPERTY, true)).build());

    private static final Logger LOGGER = LoggerFactory.getLogger(WorkflowManagerImpl.class);

    private final ItemManager itemManager;
    private final UniqueValueService uniqueValueService;
    private final WorkflowMapper workflowMapper;
    private final VersionStateMapper versionStateMapper;

    @Autowired
    public WorkflowManagerImpl(ItemManager itemManager,
            @Qualifier("uniqueValueService") UniqueValueService uniqueValueService, WorkflowMapper workflowMapper,
            VersionStateMapper versionStateMapper) {
        this.itemManager = itemManager;
        this.uniqueValueService = uniqueValueService;
        this.workflowMapper = workflowMapper;
        this.versionStateMapper = versionStateMapper;
    }

    @Override
    public Page<Workflow> list(Set<WorkflowVersionState> versionStatesFilter, RequestSpec requestSpec) {
        requestSpec = getRequestSpec(requestSpec);

        Set<VersionStatus> versionStatusesFilter =
                versionStatesFilter == null ? null :
                        versionStatesFilter.stream().map(versionStateMapper::workflowVersionStateToVersionStatus)
                                           .collect(Collectors.toSet());

        Collection<Item> workflowItems = itemManager.list(getFilter(versionStatusesFilter));

        List<Workflow> workflowsSlice = workflowItems.stream().map(workflowMapper::itemToWorkflow)
                                                     .sorted(getWorkflowComparator(requestSpec.getSorting()))
                                                     .skip(requestSpec.getPaging().getOffset())
                                                     .limit(requestSpec.getPaging().getLimit())
                                                     .collect(Collectors.toList());
        return new Page<>(workflowsSlice, requestSpec.getPaging(), workflowItems.size());
    }

    @Override
    public Workflow get(Workflow workflow) {
        Item retrievedItem = itemManager.get(workflow.getId());
        if (retrievedItem == null) {
            LOGGER.error(String.format("Workflow with id %s was not found", workflow.getId()));
            throw new EntityNotFoundException(String.format(WORKFLOW_NOT_FOUND_ERROR_MSG, workflow.getId()));
        }
        return this.workflowMapper.itemToWorkflow(retrievedItem);
    }

    @Override
    public Workflow create(Workflow workflow) {
        Item item = workflowMapper.workflowToItem(workflow);
        item.setStatus(ItemStatus.ACTIVE);

        uniqueValueService.validateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, new String[] {workflow.getName()});
        Item createdItem = itemManager.create(item);
        uniqueValueService.createUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, new String[] {workflow.getName()});

        return workflowMapper.itemToWorkflow(createdItem);
    }

    @Override
    public void update(Workflow workflow) {
        Item retrievedItem = itemManager.get(workflow.getId());
        if (retrievedItem == null) {
            LOGGER.error(String.format("Workflow with id %s was not found", workflow.getId()));
            throw new EntityNotFoundException(String.format(WORKFLOW_NOT_FOUND_ERROR_MSG, workflow.getId()));
        }

        uniqueValueService.updateUniqueValue(WORKFLOW_NAME_UNIQUE_TYPE, retrievedItem.getName(), workflow.getName());

        Item item = workflowMapper.workflowToItem(workflow);
        item.setId(workflow.getId());
        item.setStatus(retrievedItem.getStatus());
        item.setVersionStatusCounters(retrievedItem.getVersionStatusCounters());
        itemManager.update(item);
    }

    private RequestSpec getRequestSpec(RequestSpec requestSpec) {
        if (requestSpec == null) {
            return WORKSPACES_DEFAULT_REQUEST_SPEC;
        }
        if (requestSpec.getPaging() == null) {
            requestSpec.setPaging(WORKSPACES_DEFAULT_REQUEST_SPEC.getPaging());
        } else if (requestSpec.getPaging().getLimit() > MAX_LIMIT) {
            requestSpec.getPaging().setLimit(MAX_LIMIT);
        }
        if (requestSpec.getSorting() == null) {
            requestSpec.setSorting(WORKSPACES_DEFAULT_REQUEST_SPEC.getSorting());
        }
        return requestSpec;
    }

    private Comparator<Workflow> getWorkflowComparator(SortingRequest sorting) {
        Boolean byNameAscending = sorting.getSorts().stream()
                                  .filter(sort -> WORKSPACES_SORT_PROPERTY.equalsIgnoreCase(sort.getProperty()))
                                  .findFirst().map(Sort::isAscendingOrder).orElse(true);
        Comparator<Workflow> byName = Comparator.comparing(Workflow::getName);

        return byNameAscending ? byName : byName.reversed();
    }

    private static Predicate<Item> getFilter(Set<VersionStatus> versionStatuses) {
        return WORKFLOW_ITEM_FILTER
                       .and(item -> versionStatuses == null || item.getVersionStatusCounters().keySet().stream()
                                                                   .anyMatch(versionStatuses::contains));
    }
}
