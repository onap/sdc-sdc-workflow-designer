/*
 * Copyright © 2016-2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onap.sdc.workflow.activityspec.api.rest;

import static org.onap.sdc.workflow.api.RestParams.USER_ID_HEADER;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.onap.sdc.workflow.activityspec.api.rest.mapping.MapActivitySpecRequestDtoToActivitySpecEntity;
import org.onap.sdc.workflow.activityspec.api.rest.mapping.MapActivitySpecToActivitySpecCreateResponse;
import org.onap.sdc.workflow.activityspec.api.rest.mapping.MapActivitySpecToActivitySpecGetResponse;
import org.onap.sdc.workflow.activityspec.api.rest.mapping.MapItemToListResponseDto;
import org.onap.sdc.workflow.activityspec.api.rest.types.ActivitySpecActionRequestDto;
import org.onap.sdc.workflow.activityspec.api.rest.types.ActivitySpecCreateResponse;
import org.onap.sdc.workflow.activityspec.api.rest.types.ActivitySpecGetResponse;
import org.onap.sdc.workflow.activityspec.api.rest.types.ActivitySpecListResponseDto;
import org.onap.sdc.workflow.activityspec.api.rest.types.ActivitySpecRequestDto;
import org.onap.sdc.workflow.activityspec.api.rest.types.InternalEmptyObject;
import org.onap.sdc.workflow.activityspec.be.ActivitySpecManager;
import org.onap.sdc.workflow.activityspec.be.dao.types.ActivitySpecEntity;
import org.onap.sdc.workflow.api.types.CollectionResponse;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping(value = "/v1.0/activity-spec")
@Api("Activity Specs")
@RestController("activitySpecController")
@Validated
public class ActivitySpecController {

    private final ActivitySpecManager activitySpecManager;

    @Autowired
    public ActivitySpecController(@Qualifier("activitySpecManager") ActivitySpecManager activitySpecManager) {
        this.activitySpecManager = activitySpecManager;
    }

    @GetMapping
    @ApiOperation(value = "List activity specs", responseContainer = "List")
    @ApiImplicitParams(
            {@ApiImplicitParam(name = USER_ID_HEADER, required = true, dataType = "string", paramType = "header")})
    public CollectionResponse<ActivitySpecListResponseDto> list(
            @ApiParam(value = "List activity specs based on status filter")
            @RequestParam(name = "status", required = false) String versionStatus) {

        MapItemToListResponseDto mapper = new MapItemToListResponseDto();
        return new CollectionResponse<>(activitySpecManager.list(versionStatus).stream()
                                                           .sorted((o1, o2) -> o2.getModificationTime()
                                                                                 .compareTo(o1.getModificationTime()))
                                                           .map(activitySpecItem -> mapper.applyMapping(
                                                                   activitySpecItem, ActivitySpecListResponseDto.class))
                                                           .collect(Collectors.toList()));

    }

    @PostMapping
    @ApiOperation(value = "Create Activity Spec")
    @ApiImplicitParams(
            {@ApiImplicitParam(name = USER_ID_HEADER, required = true, dataType = "string", paramType = "header")})
    public ResponseEntity<ActivitySpecCreateResponse> create(@Valid @RequestBody ActivitySpecRequestDto request) {
        ActivitySpecEntity activitySpec =
                new MapActivitySpecRequestDtoToActivitySpecEntity().applyMapping(request, ActivitySpecEntity.class);

        activitySpec = activitySpecManager.createActivitySpec(activitySpec);
        return new ResponseEntity<>(new MapActivitySpecToActivitySpecCreateResponse()
                                            .applyMapping(activitySpec, ActivitySpecCreateResponse.class),
                HttpStatus.CREATED);
    }

    @GetMapping("/{id}/versions/{versionId}")
    @ApiOperation(value = "Get Activity Spec")
    @ApiImplicitParams(
            {@ApiImplicitParam(name = USER_ID_HEADER, required = true, dataType = "string", paramType = "header")})
    public ActivitySpecGetResponse get(@ApiParam(value = "Activity Spec Id") @PathVariable("id") String activitySpecId,
            @ApiParam(value = "Version Id") @PathVariable("versionId") String versionId) {
        ActivitySpecEntity activitySpec = new ActivitySpecEntity();
        activitySpec.setId(activitySpecId);
        activitySpec.setVersion(new Version(versionId));
        final ActivitySpecEntity retrieved = activitySpecManager.get(activitySpec);
        return new MapActivitySpecToActivitySpecGetResponse().applyMapping(retrieved, ActivitySpecGetResponse.class);
    }

    @PutMapping("/{id}/versions/{versionId}")
    @ApiOperation(value = "Update Activity Spec")
    @ApiImplicitParams(
            {@ApiImplicitParam(name = USER_ID_HEADER, required = true, dataType = "string", paramType = "header")})
    public InternalEmptyObject update(@Valid @RequestBody ActivitySpecRequestDto request,
            @ApiParam(value = "Activity Spec Id") @PathVariable("id") String activitySpecId,
            @ApiParam(value = "Version Id") @PathVariable("versionId") String versionId) {
        ActivitySpecEntity activitySpec =
                new MapActivitySpecRequestDtoToActivitySpecEntity().applyMapping(request, ActivitySpecEntity.class);

        activitySpec.setId(activitySpecId);
        activitySpec.setVersion(new Version(versionId));

        activitySpecManager.update(activitySpec);

        return new InternalEmptyObject();
    }

    @PutMapping("/{id}/versions/{versionId}/actions")
    @ApiOperation(value = "Actions on a activity spec",
            notes = "Performs one of the following actions on a activity spec: |" + "CERTIFY: Certifies activity spec.|"
                            + "DEPRECATE: Deprecates activity spec.|" + "DELETE: Deletes activity spec.")
    @ApiImplicitParams(
            {@ApiImplicitParam(name = USER_ID_HEADER, required = true, dataType = "string", paramType = "header")})
    public InternalEmptyObject actOn(@Valid @RequestBody ActivitySpecActionRequestDto request,
            @ApiParam(value = "Activity Spec Id") @PathVariable("id") String activitySpecId,
            @ApiParam(value = "Version Id") @PathVariable("versionId") String versionId) {
        activitySpecManager.actOnAction(activitySpecId, versionId, request.getAction());
        return new InternalEmptyObject();
    }
}
