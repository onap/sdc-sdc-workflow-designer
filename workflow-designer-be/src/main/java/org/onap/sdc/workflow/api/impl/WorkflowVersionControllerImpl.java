package org.onap.sdc.workflow.api.impl;

import static org.onap.sdc.workflow.api.RestConstants.USER_ID_HEADER_PARAM;

import org.onap.sdc.workflow.api.WorkflowVersionController;
import org.onap.sdc.workflow.api.types.CollectionWrapper;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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
    public CollectionWrapper<Version> list(@PathVariable("id") String id,@RequestHeader(USER_ID_HEADER_PARAM) String user) {
        return new CollectionWrapper<>(workflowVersionManager.list(id));
    }

    @Override
    public ResponseEntity<?>  create(@PathVariable("id") String id,@RequestBody Version version,
            @RequestHeader(USER_ID_HEADER_PARAM) String user) {

         Version createdVersion = workflowVersionManager.create(id, version);

        return new ResponseEntity<>(createdVersion, HttpStatus.CREATED);
    }

    @Override
    public Version get(@PathVariable("id") String id,@PathVariable("versionId") String versionId,
            @RequestHeader(USER_ID_HEADER_PARAM)  String user) {
        Version version = new Version(versionId);
        return workflowVersionManager.get(id,version);
    }

    @Override
    public void update(@PathVariable("id") String id, @PathVariable("versionId") String versionId,
            @RequestBody Version version, @RequestHeader(USER_ID_HEADER_PARAM) String user) {

        version.setId(versionId);
        workflowVersionManager.update(id,version);
    }

    @Override
    public void createArtifact(@PathVariable("id") String id, @PathVariable("versionId") String versionId,
            @RequestBody MultipartFile fileToUpload, @RequestHeader(USER_ID_HEADER_PARAM) String user) {

            workflowVersionManager.updateArtifact(id,new Version(versionId),fileToUpload);

    }

    @Override
    public ResponseEntity<Resource> getAtrifact(@PathVariable("id") String id, @PathVariable("versionId") String versionId,
            @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        Resource artifactData = workflowVersionManager.getArtifactData(id, new Version(versionId));
        String fileName = workflowVersionManager.getArtifactFileName(id, new Version(versionId));

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + fileName)
                             .contentType(MediaType.APPLICATION_OCTET_STREAM).body(artifactData);
    }
}
