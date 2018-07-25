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
package org.onap.sdc.workflow;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;

public class RestUtils {

    private RestUtils() {
    }

    private static final Logger LOGGER = LoggerFactory.getLogger(RestUtils.class);

    public static Set<WorkflowVersionState> mapVersionStateFilter(String versionStateFilter) {
        Set<WorkflowVersionState> filter;
        try {
            filter = versionStateFilter == null ? null :
                             Arrays.stream(versionStateFilter.split(",")).map(WorkflowVersionState::valueOf)
                                   .collect(Collectors.toSet());
        } catch (Exception e) {
            LOGGER.info(
                    "version state filter value is invalid and cannot be mapped to a set of version states, therefore it is set to empty set");
            filter = Collections.emptySet();
        }
        return filter;
    }

    public static boolean shouldExpandVersions(String expand) {
        if(expand == null){
            return false;
        }
        return "versions".equals(expand);
    }
}
