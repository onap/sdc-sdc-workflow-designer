package org.onap.sdc.workflow.api;


import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.onap.sdc.workflow.api.types.CollectionWrapper;
import org.onap.sdc.workflow.api.types.VersionRequestDto;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/workflows/{workflowId}/versions")
@Api("Workflow versions")
public interface WorkflowVersionController {


    @GetMapping
    @ApiOperation("List workflow versions")
    CollectionWrapper<WorkflowVersion> list(String workflowId,String user);

    @PostMapping
    @ApiOperation("Create workflow version")
    ResponseEntity<WorkflowVersion> create(String workflowId, VersionRequestDto versionRequest, String user);

    @GetMapping("/{versionId}")
    @ApiOperation("Get workflow version")
    WorkflowVersion get(String workflowId,String versionId, String user);

    @PutMapping("/{versionId}")
    @ApiOperation("Update workflow version")
    void update(WorkflowVersion version,String workflowId, String versionId, String user);


    @PutMapping("/{versionId}/artifact")
    @ApiOperation("Create/update artifact of a version")
    void createArtifact(MultipartFile fileToUpload, String workflowId, String versionId, String user);

    @GetMapping("/{versionId}/artifact")
    @ApiOperation("Download workflow version artifact")
    ResponseEntity<Resource> getArtifact(String workflowId, String versionId, String user);

    @DeleteMapping("/{versionId}/artifact")
    @ApiOperation("Delete workflow version artifact")
    void deleteArtifact(String workflowId, String versionId, String user);
}
