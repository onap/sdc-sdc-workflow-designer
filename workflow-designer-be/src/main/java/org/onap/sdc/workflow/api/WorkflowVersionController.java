package org.onap.sdc.workflow.api;


import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.onap.sdc.workflow.api.types.CollectionWrapper;
import org.onap.sdc.workflow.api.types.VersionRequestDto;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/workflows/{id}/versions")
@Api("Workflow versions")
public interface WorkflowVersionController {


    @GetMapping
    @ApiOperation("List workflow versions")
    CollectionWrapper<WorkflowVersion> list(String id, String user);

    @PostMapping
    @ApiOperation("Create workflow version")
    ResponseEntity<WorkflowVersion> create(String id, VersionRequestDto versionRequest, String user);

    @GetMapping("/{versionId}")
    @ApiOperation("Get workflow version")
    WorkflowVersion get(String id,String versionId, String user);

    @PutMapping("/{versionId}")
    @ApiOperation("Update workflow version")
    void update(WorkflowVersion version,String id, String versionId, String user);


    @PutMapping("/{versionId}/artifact")
    @ApiOperation("Create/update artifact of a version")
    void createArtifact(MultipartFile fileToUpload, String id, String versionId, String user);

    @GetMapping("/{versionId}/artifact")
    @ApiOperation("Download Artifact")
    ResponseEntity<Resource> getArtifact(String id, String versionId, String user);
}
