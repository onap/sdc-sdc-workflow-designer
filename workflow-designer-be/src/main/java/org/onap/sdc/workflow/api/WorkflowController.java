package org.onap.sdc.workflow.api;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.onap.sdc.workflow.api.types.CollectionWrapper;
import org.onap.sdc.workflow.api.types.PaginationParametersRequestDto;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/workflows")
@Api("Workflows")
public interface WorkflowController {

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation("List workflows")
    CollectionWrapper<Workflow> list(String user, PaginationParametersRequestDto paginationParameters);

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation("Create workflow")
    ResponseEntity<Workflow> create(Workflow workflow, String user);

    @GetMapping(path = "/{workflowId}")
    @ApiOperation("Get workflow")
    Workflow get(String workflowId, String user);

    @PutMapping(path = "/{workflowId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation("Update workflow")
    Workflow update(Workflow workflow, String workflowId, String user);
}
