package org.onap.sdc.workflow.api.impl;

import static org.onap.sdc.workflow.api.RestConstants.USER_ID_HEADER_PARAM;

import org.onap.sdc.workflow.api.WorkflowController;
import org.onap.sdc.workflow.api.types.CollectionWrapper;
import org.onap.sdc.workflow.api.types.PaginationParameters;
import org.onap.sdc.workflow.api.types.PaginationParametersRequestDto;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController("workflowController")
public class WorkflowControllerImpl implements WorkflowController {

    private final WorkflowManager workflowManager;

    @Autowired
    public WorkflowControllerImpl(@Qualifier("workflowManager") WorkflowManager workflowManager) {
        this.workflowManager = workflowManager;
    }

    @Override
    public CollectionWrapper<Workflow> list(@RequestHeader(USER_ID_HEADER_PARAM) String user,
                                            PaginationParametersRequestDto paginationParametersRequestDto) {
        PaginationParameters paginationParameters = paginationParametersRequestDto.validatePaginationParameters();
        return new CollectionWrapper<>(workflowManager.list(paginationParameters));
    }

    @Override
    public ResponseEntity<Workflow> create(@RequestBody Workflow workflow, @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        return new ResponseEntity<>(workflowManager.create(workflow), HttpStatus.CREATED);
    }

    @Override
    public Workflow get(@PathVariable("workflowId") String workflowId, @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        Workflow workflow = new Workflow();
        workflow.setId(workflowId);
        return workflowManager.get(workflow);
    }

    @Override
    public Workflow update(@RequestBody Workflow workflow, @PathVariable("workflowId") String workflowId,
            @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        workflow.setId(workflowId);
        workflowManager.update(workflow);
        return workflow;
    }

}
