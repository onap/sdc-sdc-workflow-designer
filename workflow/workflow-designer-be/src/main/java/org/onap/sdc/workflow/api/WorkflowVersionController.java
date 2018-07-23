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

import static org.onap.sdc.workflow.api.RestConstants.USER_ID_HEADER_PARAM;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.api.types.CollectionWrapper;
import org.onap.sdc.workflow.api.types.VersionStateDto;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/workflows/{workflowId}/versions")
@Api("Workflow versions")
@RestController("workflowsVersionController")
public class WorkflowVersionController {

    private static final Logger LOGGER = LoggerFactory.getLogger(WorkflowVersionController.class);
    private final WorkflowVersionManager workflowVersionManager;

    @Autowired
    public WorkflowVersionController(
            @Qualifier("workflowVersionManager") WorkflowVersionManager workflowVersionManager) {
        this.workflowVersionManager = workflowVersionManager;
    }

    @GetMapping
    @ApiOperation("List workflow versions")
    public CollectionWrapper<WorkflowVersion> list(@PathVariable("workflowId") String workflowId,
            @ApiParam(value = "Filter by state", allowableValues = "DRAFT,CERTIFIED")
            @RequestParam(value = "state", required = false) String stateFilter,
            @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        Set<WorkflowVersionState> filter;
        try {
            filter = stateFilter == null ? null :
                             Arrays.stream(stateFilter.split(",")).map(WorkflowVersionState::valueOf)
                                   .collect(Collectors.toSet());
        } catch (Exception e) {
            LOGGER.info("Invalid state filter value - return empty list of workflow versions");
            return new CollectionWrapper<>(Collections.emptyList());
        }
        return new CollectionWrapper<>(workflowVersionManager.list(workflowId, filter));
    }

    @PostMapping
    @ApiOperation("Create workflow version")
    public ResponseEntity<WorkflowVersion> create(@RequestBody WorkflowVersion version,
            @PathVariable("workflowId") String workflowId,
            @RequestParam(value = "baseVersionId", required = false) String baseVersionId,
            @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        WorkflowVersion createdVersion = workflowVersionManager.create(workflowId, baseVersionId, version);
        return new ResponseEntity<>(createdVersion, HttpStatus.CREATED);
    }

    @GetMapping("/{versionId}")
    @ApiOperation("Get workflow version")
    public WorkflowVersion get(@PathVariable("workflowId") String workflowId,
            @PathVariable("versionId") String versionId, @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        return workflowVersionManager.get(workflowId, versionId);
    }

    @PutMapping("/{versionId}")
    @ApiOperation("Update workflow version")
    public void update(@RequestBody WorkflowVersion version, @PathVariable("workflowId") String workflowId,
            @PathVariable("versionId") String versionId, @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        version.setId(versionId);
        workflowVersionManager.update(workflowId, version);
    }

    @GetMapping("/{versionId}/state")
    @ApiOperation("Get workflow version state")
    public VersionStateDto getState(@PathVariable("workflowId") String workflowId,
            @PathVariable("versionId") String versionId, @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        return new VersionStateDto(workflowVersionManager.getState(workflowId, versionId));
    }

    @PostMapping("/{versionId}/state")
    @ApiOperation("Update workflow version state")
    public VersionStateDto updateState(@RequestBody VersionStateDto state,
            @PathVariable("workflowId") String workflowId, @PathVariable("versionId") String versionId,
            @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        workflowVersionManager.updateState(workflowId, versionId, state.getName());
        return new VersionStateDto(state.getName());
    }

    @PutMapping("/{versionId}/artifact")
    @ApiOperation("Create/update artifact of a version")
    public void uploadArtifact(@RequestBody MultipartFile fileToUpload, @PathVariable("workflowId") String workflowId,
            @PathVariable("versionId") String versionId, @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        workflowVersionManager.uploadArtifact(workflowId, versionId, fileToUpload);
    }

    @GetMapping("/{versionId}/artifact")
    @ApiOperation("Download workflow version artifact")
    public ResponseEntity<Resource> getArtifact(@PathVariable("workflowId") String workflowId,
            @PathVariable("versionId") String versionId, @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        ArtifactEntity artifact = workflowVersionManager.getArtifact(workflowId, versionId);

        return ResponseEntity.ok()
                             .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + artifact.getFileName())
                             .contentType(MediaType.APPLICATION_OCTET_STREAM)
                             .body(new InputStreamResource(artifact.getArtifactData()));
    }

    @DeleteMapping("/{versionId}/artifact")
    @ApiOperation("Delete workflow version artifact")
    public void deleteArtifact(@PathVariable("workflowId") String workflowId,
            @PathVariable("versionId") String versionId, @RequestHeader(USER_ID_HEADER_PARAM) String user) {
        workflowVersionManager.deleteArtifact(workflowId, versionId);
    }
}
