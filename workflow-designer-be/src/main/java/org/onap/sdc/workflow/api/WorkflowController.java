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

package org.onap.sdc.workflow.api;

import static org.onap.sdc.workflow.api.RestParams.LIMIT;
import static org.onap.sdc.workflow.api.RestParams.OFFSET;
import static org.onap.sdc.workflow.api.RestParams.SORT;
import static org.onap.sdc.workflow.api.RestParams.USER_ID_HEADER;
import static org.onap.sdc.workflow.services.types.PagingConstants.DEFAULT_LIMIT;
import static org.onap.sdc.workflow.services.types.PagingConstants.DEFAULT_OFFSET;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.onap.sdc.workflow.api.types.Paging;
import org.onap.sdc.workflow.api.types.Sorting;
import org.onap.sdc.workflow.api.types.VersionStatesFormatter;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.onap.sdc.workflow.services.types.Page;
import org.onap.sdc.workflow.services.types.PagingRequest;
import org.onap.sdc.workflow.services.types.RequestSpec;
import org.onap.sdc.workflow.services.types.SortingRequest;
import org.onap.sdc.workflow.services.types.Workflow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import springfox.documentation.annotations.ApiIgnore;

@RequestMapping("/wf/workflows")
@Api("Workflows")
@RestController("workflowController")
public class WorkflowController {

    private final WorkflowManager workflowManager;
    private final WorkflowVersionManager workflowVersionManager;

    @Autowired
    public WorkflowController(@Qualifier("workflowManager") WorkflowManager workflowManager,
            @Qualifier("workflowVersionManager") WorkflowVersionManager workflowVersionManager) {
        this.workflowManager = workflowManager;
        this.workflowVersionManager = workflowVersionManager;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation("List workflows")
    @ApiImplicitParams({@ApiImplicitParam(name = "versionState", dataType = "string", paramType = "query",
            allowableValues = "DRAFT,CERTIFIED", value = "Filter by version state"),
            @ApiImplicitParam(name = OFFSET, dataType = "string", paramType = "query", defaultValue = "0",
                    value = "Index of the starting item"),
            @ApiImplicitParam(name = LIMIT, dataType = "string", paramType = "query", defaultValue = "200",
                    value = "Number of returned items"),
            @ApiImplicitParam(name = SORT, dataType = "string", paramType = "query", defaultValue = "name:asc",
                    value = "Sorting criteria in the format: property:(asc|desc). Default sort order is ascending.",
                    allowableValues = "name:asc,name:desc"),
            @ApiImplicitParam(name = "searchNameFilter", dataType = "string", paramType = "query",
            value = "Filter by workflow name")})
    public Page<Workflow> list(@ApiIgnore String searchNameFilter,
            @ApiIgnore VersionStatesFormatter versionStateFilter, @ApiIgnore Paging paging,
            @ApiIgnore Sorting sorting, @RequestHeader(USER_ID_HEADER) String user) {
        return workflowManager.list(searchNameFilter,versionStateFilter.getVersionStates(), initRequestSpec(paging, sorting));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation("Create workflow")
    public ResponseEntity<Workflow> create(@Validated @RequestBody Workflow workflow,
            @RequestHeader(USER_ID_HEADER) String user) {
        return new ResponseEntity<>(workflowManager.create(workflow), HttpStatus.CREATED);
    }

    @GetMapping(path = "/{workflowId}")
    @ApiOperation("Get workflow")
    public Workflow get(@PathVariable("workflowId") String workflowId,
            @ApiParam(value = "Expand workflow data", allowableValues = "versions")
            @RequestParam(value = "expand", required = false) String expand,
            @RequestHeader(USER_ID_HEADER) String user) {
        Workflow workflow = new Workflow();
        workflow.setId(workflowId);
        Workflow retrievedWorkflow = workflowManager.get(workflow);
        if ("versions".equals(expand)) {
            retrievedWorkflow.setVersions(workflowVersionManager.list(workflowId, null));
        }
        return retrievedWorkflow;
    }

    @PutMapping(path = "/{workflowId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation("Update workflow")
    public Workflow update(@RequestBody Workflow workflow, @PathVariable("workflowId") String workflowId,
            @RequestHeader(USER_ID_HEADER) String user) {
        workflow.setId(workflowId);
        workflowManager.update(workflow);
        return workflow;
    }

    private RequestSpec initRequestSpec(Paging paging, Sorting sorting) {
        return new RequestSpec(new PagingRequest(paging.getOffset() == null ? DEFAULT_OFFSET : paging.getOffset(),
                paging.getLimit() == null ? DEFAULT_LIMIT : paging.getLimit()),
                SortingRequest.builder().sorts(sorting.getSorts()).build());
    }
}
