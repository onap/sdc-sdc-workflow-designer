package org.onap.sdc.workflow.api;


import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.onap.sdc.workflow.api.types.CollectionWrapper;
import org.openecomp.sdc.versioning.dao.types.Version;
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
    CollectionWrapper<Version> list(String id, String user);

    @PostMapping
    @ApiOperation("Create workflow version")
    ResponseEntity create(String id, Version version, String user);

    @GetMapping("/{versionId}")
    @ApiOperation("Get workflow version")
    Version get(String id,String versionId, String user);

    @PutMapping("/{versionId}")
    @ApiOperation("Update workflow version")
    void update(String id, String versionId,Version version, String user);


    @PutMapping("/{versionId}/artifact")
    @ApiOperation("Create/update artifact of a version")
    void createArtifact(String id, String versionId, MultipartFile fileToUpload, String user);

    @GetMapping("/{versionId}/artifact")
    @ApiOperation("Download Artifact")
    ResponseEntity<Resource> getAtrifact(String id, String versionId, String user);
}
