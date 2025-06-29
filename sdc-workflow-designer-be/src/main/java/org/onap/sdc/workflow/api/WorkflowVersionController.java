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

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.onap.sdc.workflow.api.mappers.WorkflowVersionDtoMapper;
import org.onap.sdc.workflow.api.types.CollectionResponse;
import org.onap.sdc.workflow.api.types.VersionStateDto;
import org.onap.sdc.workflow.api.types.VersionStatesFormatter;
import org.onap.sdc.workflow.api.types.WorkflowVersionRequest;
import org.onap.sdc.workflow.api.types.WorkflowVersionResponse;
import org.onap.sdc.workflow.api.types.dto.ArtifactDeliveriesRequestDto;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.onap.sdc.workflow.services.annotations.UserId;
import org.onap.sdc.workflow.services.types.WorkflowVersion;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import springfox.documentation.annotations.ApiIgnore;

@RequestMapping("/wf/workflows/{workflowId}/versions")
@Api("Workflow versions")
@RestController("workflowsVersionController")
public class WorkflowVersionController {

    private final WorkflowVersionManager versionManager;
    private final WorkflowVersionDtoMapper versionDtoMapper;
    private final ArtifactAssociationService associationHandler;

    public WorkflowVersionController(@Qualifier("workflowVersionManager") WorkflowVersionManager versionManager,
            WorkflowVersionDtoMapper versionDtoMapper,
            @Qualifier("ArtifactAssociationHandler") ArtifactAssociationService artifactAssociationHandler) {
        this.versionManager = versionManager;
        this.versionDtoMapper = versionDtoMapper;
        this.associationHandler = artifactAssociationHandler;
    }

    @GetMapping
    @ApiOperation("List workflow versions")
    @ApiImplicitParam(name = "state", dataType = "string", paramType = "query", allowableValues = "DRAFT,CERTIFIED",
            value = "Filter by state")
    public CollectionResponse<WorkflowVersionResponse> list(@PathVariable String workflowId,
            @ApiIgnore VersionStatesFormatter stateFilter, @UserId String user) {
        return new CollectionResponse<>(versionManager.list(workflowId, stateFilter.getVersionStates()).stream()
                                                .map(versionDtoMapper::workflowVersionToResponse)
                                                .collect(Collectors.toList()));
    }

    @PostMapping
    @ApiOperation("Create workflow version")
    public ResponseEntity<WorkflowVersionResponse> create(@RequestBody @Valid WorkflowVersionRequest request,
            @PathVariable String workflowId,
            @RequestParam(required = false) String baseVersionId, @UserId String user) {
        WorkflowVersionResponse createdVersion = versionDtoMapper.workflowVersionToResponse(
                versionManager.create(workflowId, baseVersionId, versionDtoMapper.requestToWorkflowVersion(request)));
        return new ResponseEntity<>(createdVersion, HttpStatus.CREATED);
    }

    @GetMapping("/{versionId}")
    @ApiOperation("Get workflow version")
    public WorkflowVersionResponse get(@PathVariable String workflowId,
            @PathVariable String versionId, @UserId String user) {
        return versionDtoMapper.workflowVersionToResponse(versionManager.get(workflowId, versionId));
    }

    @PutMapping("/{versionId}")
    @ApiOperation("Update workflow version")
    public void update(@RequestBody @Valid WorkflowVersionRequest request,
            @PathVariable String workflowId, @PathVariable String versionId,
            @UserId String user) {
        WorkflowVersion version = versionDtoMapper.requestToWorkflowVersion(request);
        version.setId(versionId);
        versionManager.update(workflowId, version);
    }

    @GetMapping("/{versionId}/state")
    @ApiOperation("Get workflow version state")
    public VersionStateDto getState(@PathVariable String workflowId,
            @PathVariable String versionId, @UserId String user) {
        return new VersionStateDto(versionManager.getState(workflowId, versionId));
    }

    @PostMapping("/{versionId}/state")
    @ApiOperation("Update workflow version state")
    public VersionStateDto updateState(@RequestBody VersionStateDto state,
            @PathVariable String workflowId, @PathVariable String versionId,
            @UserId String user) {
        versionManager.updateState(workflowId, versionId, state.getName());
        return new VersionStateDto(state.getName());
    }

    @PostMapping("/{versionId}/artifact-deliveries")
    @ApiOperation("upload of artifact to VF operation workflow")
    public ResponseEntity<String> artifactDeliveries(@RequestBody ArtifactDeliveriesRequestDto deliveriesRequestDto,
            @PathVariable String workflowId, @PathVariable String versionId,
            @UserId String user) {
        return associationHandler
                       .execute(user, deliveriesRequestDto, versionManager.getArtifact(workflowId, versionId));
    }

    @PutMapping("/{versionId}/artifact")
    @ApiOperation("Create/update artifact of a version")
    public void uploadArtifact(@RequestBody MultipartFile fileToUpload, @PathVariable String workflowId,
            @PathVariable String versionId, @UserId String user) {
        versionManager.uploadArtifact(workflowId, versionId, fileToUpload);
    }

    @GetMapping("/{versionId}/artifact")
    @ApiOperation("Download workflow version artifact")
    public ResponseEntity<Resource> getArtifact(@PathVariable String workflowId,
            @PathVariable String versionId, @UserId String user) {
        ArtifactEntity artifact = versionManager.getArtifact(workflowId, versionId);

        return ResponseEntity.ok()
                       .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + artifact.getFileName())
                       .contentType(MediaType.APPLICATION_OCTET_STREAM)
                       .body(new InputStreamResource(artifact.getArtifactData()));
    }

    @DeleteMapping("/{versionId}/artifact")
    @ApiOperation("Delete workflow version artifact")
    public void deleteArtifact(@PathVariable String workflowId,
            @PathVariable String versionId, @UserId String user) {
        versionManager.deleteArtifact(workflowId, versionId);
    }
}
