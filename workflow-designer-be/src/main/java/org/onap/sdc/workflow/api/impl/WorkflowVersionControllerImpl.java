package org.onap.sdc.workflow.api.impl;

import static org.onap.sdc.workflow.api.RestConstants.USER_ID_HEADER_PARAM;

import org.onap.sdc.workflow.api.WorkflowVersionController;
import org.onap.sdc.workflow.api.types.CollectionWrapper;
import org.onap.sdc.workflow.api.types.VersionRequestDto;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController("workflowsVersionController")
public class WorkflowVersionControllerImpl implements WorkflowVersionController {

    private final WorkflowVersionManager workflowVersionManager;

    @Autowired
    public WorkflowVersionControllerImpl(@Qualifier("workflowVersionManager") WorkflowVersionManager workflowVersionManager) {
        this.workflowVersionManager = workflowVersionManager;
    }

    @Override
    public CollectionWrapper<WorkflowVersion> list(@PathVariable("id") String id,@RequestHeader(USER_ID_HEADER_PARAM) String user) {
        return new CollectionWrapper<>(workflowVersionManager.list(id));
    }

    @Override
    public ResponseEntity<WorkflowVersion> create(@PathVariable("id") String id,@RequestBody VersionRequestDto versionRequest,
            @RequestHeader(USER_ID_HEADER_PARAM) String user) {

        WorkflowVersion createdVersion = workflowVersionManager.create(id, versionRequest);
        return new ResponseEntity<>(createdVersion, HttpStatus.CREATED);
    }

    @Override
    public WorkflowVersion get(@PathVariable("id") String id,@PathVariable("versionId") String versionId,
            @RequestHeader(USER_ID_HEADER_PARAM)  String user) {
        WorkflowVersion version = new WorkflowVersion(versionId);
        return workflowVersionManager.get(id,version);
    }

    @Override
    public void update(@RequestBody WorkflowVersion version,@PathVariable("id") String id,
            @PathVariable("versionId") String versionId, @RequestHeader(USER_ID_HEADER_PARAM) String user) {

        version.setId(versionId);
        workflowVersionManager.update(id,version);
    }

    @Override
    public void createArtifact(@RequestBody MultipartFile fileToUpload, @PathVariable("id") String id,
            @PathVariable("versionId") String versionId,@RequestHeader(USER_ID_HEADER_PARAM) String user) {

            workflowVersionManager.uploadArtifact(id,new WorkflowVersion(versionId),fileToUpload);

    }

    @Override
    public ResponseEntity<Resource> getArtifact(@PathVariable("id") String id,
            @PathVariable("versionId") String versionId, @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        WorkflowVersion requestedVersion = new WorkflowVersion(versionId);
        ArtifactEntity artifact = workflowVersionManager.getArtifact(id, requestedVersion);

        return ResponseEntity.ok()
                             .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + artifact.getFileName())
                             .contentType(MediaType.APPLICATION_OCTET_STREAM)
                             .body(new InputStreamResource(artifact.getArtifactData()));
    }
}
