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

package org.onap.sdc.workflow.api.mappers;

import org.mapstruct.Mapper;
import org.onap.sdc.workflow.api.types.activityspec.ActivitySpecDataResponse;
import org.onap.sdc.workflow.api.types.activityspec.ActivitySpecRequest;
import org.onap.sdc.workflow.api.types.activityspec.ActivitySpecResponse;
import org.onap.sdc.workflow.persistence.types.ActivitySpecEntity;

@Mapper(componentModel = "spring")
public interface ActivitySpecDtoMapper {

    ActivitySpecResponse toActivitySpecResponse(ActivitySpecEntity activitySpec);

    ActivitySpecDataResponse toActivitySpecDataResponse(ActivitySpecEntity activitySpec);

    ActivitySpecEntity fromActivitySpecRequest(ActivitySpecRequest request);

}
