package org.onap.sdc.workflow.api;

import static org.onap.sdc.workflow.api.RestConstants.USER_ID_HEADER_PARAM;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.onap.sdc.workflow.api.types.CollectionWrapper;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/workflows")
@Api("Workflows")
public interface WorkflowController {

    @GetMapping
    @ApiOperation("List workflows")
    CollectionWrapper<Workflow> list(@RequestHeader(USER_ID_HEADER_PARAM) String user);

    @PostMapping
    @ApiOperation("Create workflow")
    Workflow create(@RequestBody Workflow workflow, @RequestHeader(USER_ID_HEADER_PARAM) String user);

    @GetMapping("/{id}")
    @ApiOperation("Get workflow")
    Workflow get(@PathVariable("id") String id, @RequestHeader(USER_ID_HEADER_PARAM) String user);

    @PutMapping("/{id}")
    @ApiOperation("Update workflow")
    Workflow update(@RequestBody Workflow workflow, @PathVariable("id") String id,
            @RequestHeader(USER_ID_HEADER_PARAM) String user);
}
