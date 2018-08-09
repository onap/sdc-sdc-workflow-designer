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

package org.onap.sdc.workflow.api;

import static org.onap.sdc.workflow.api.RestParams.USER_ID_HEADER;
import static org.onap.sdc.workflow.services.ActivitySpecConstant.VERSION_ID_DEFAULT_VALUE;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import java.util.Objects;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.onap.sdc.workflow.api.mappers.ActivitySpecDtoMapper;
import org.onap.sdc.workflow.api.types.CollectionResponse;
import org.onap.sdc.workflow.api.types.activityspec.ActivitySpecActionRequest;
import org.onap.sdc.workflow.api.types.activityspec.ActivitySpecCreateResponse;
import org.onap.sdc.workflow.api.types.activityspec.ActivitySpecDataResponse;
import org.onap.sdc.workflow.api.types.activityspec.ActivitySpecRequest;
import org.onap.sdc.workflow.api.types.activityspec.ActivitySpecResponse;
import org.onap.sdc.workflow.persistence.types.ActivitySpecEntity;
import org.onap.sdc.workflow.services.ActivitySpecManager;
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
    private final ActivitySpecDtoMapper activitySpecDtoMapper;

    @Autowired
    public ActivitySpecController(@Qualifier("activitySpecManager") ActivitySpecManager activitySpecManager,
            ActivitySpecDtoMapper activitySpecDtoMapper) {
        this.activitySpecManager = activitySpecManager;
        this.activitySpecDtoMapper = activitySpecDtoMapper;
    }

    @GetMapping
    @ApiOperation(value = "List activity specs", responseContainer = "List")
    @ApiImplicitParam(name = USER_ID_HEADER, required = true, dataType = "string", paramType = "header")
    public CollectionResponse<ActivitySpecResponse> list(@ApiParam(value = "List activity specs based on status filter",
            allowableValues = "Draft,Certified,Deprecated,Deleted") @RequestParam(name = "status", required = false)
                                                                 String versionStatus) {
        return new CollectionResponse<>(
                activitySpecManager.list(versionStatus).stream().map(activitySpecDtoMapper::toActivitySpecResponse)
                        .collect(Collectors.toList()));
    }

    @PostMapping
    @ApiOperation(value = "Create Activity Spec")
    @ApiImplicitParam(name = USER_ID_HEADER, required = true, dataType = "string", paramType = "header")
    public ResponseEntity<ActivitySpecCreateResponse> create(@Valid @RequestBody ActivitySpecRequest request) {
        ActivitySpecEntity activitySpec =
                activitySpecManager.createActivitySpec(activitySpecDtoMapper.fromActivitySpecRequest(request));
        return new ResponseEntity<>(new ActivitySpecCreateResponse(activitySpec.getId(),
                Objects.nonNull(activitySpec.getVersion()) ? activitySpec.getVersion().getId() : null),
                HttpStatus.CREATED);
    }

    @GetMapping("/{id}/versions/{versionId}")
    @ApiOperation(value = "Get Activity Spec")
    @ApiImplicitParam(name = USER_ID_HEADER, required = true, dataType = "string", paramType = "header")
    public ActivitySpecDataResponse get(@ApiParam(value = "Activity Spec Id") @PathVariable("id") String activitySpecId,
            @ApiParam(value = "Version Id", defaultValue = VERSION_ID_DEFAULT_VALUE) @PathVariable("versionId")
                    String versionId) {
        return activitySpecDtoMapper.toActivitySpecDataResponse(
                activitySpecManager.get(new ActivitySpecEntity(activitySpecId, new Version(versionId))));
    }

    @PutMapping("/{id}/versions/{versionId}")
    @ApiOperation(value = "Update Activity Spec")
    @ApiImplicitParam(name = USER_ID_HEADER, required = true, dataType = "string", paramType = "header")
    public void update(@Valid @RequestBody ActivitySpecRequest request,
            @ApiParam(value = "Activity Spec Id") @PathVariable("id") String activitySpecId,
            @ApiParam(value = "Version Id", defaultValue = VERSION_ID_DEFAULT_VALUE) @PathVariable("versionId")
                    String versionId) {
        ActivitySpecEntity activitySpec = activitySpecDtoMapper.fromActivitySpecRequest(request);
        activitySpec.setId(activitySpecId);
        activitySpec.setVersion(new Version(versionId));

        activitySpecManager.update(activitySpec);
    }

    @PutMapping("/{id}/versions/{versionId}/actions")
    @ApiOperation(value = "Actions on a activity spec",
            notes = "Performs one of the following actions on a activity spec: |" + "CERTIFY: Certifies activity spec.|"
                            + "DEPRECATE: Deprecates activity spec.|" + "DELETE: Deletes activity spec.")
    @ApiImplicitParam(name = USER_ID_HEADER, required = true, dataType = "string", paramType = "header")
    public void actOn(@Valid @RequestBody ActivitySpecActionRequest request,
            @ApiParam(value = "Activity Spec Id") @PathVariable("id") String activitySpecId,
            @ApiParam(value = "Version Id", defaultValue = VERSION_ID_DEFAULT_VALUE) @PathVariable("versionId")
                    String versionId) {
        activitySpecManager
                .actOnAction(new ActivitySpecEntity(activitySpecId, new Version(versionId)), request.getAction());
    }
}
