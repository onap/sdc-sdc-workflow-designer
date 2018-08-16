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

package org.onap.sdc.workflow.api.types;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;
import org.onap.sdc.workflow.services.types.WorkflowVersionState;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;

@Getter
public class VersionStatesFormatter {

    private static final Logger LOGGER = LoggerFactory.getLogger(VersionStatesFormatter.class);

    private Set<WorkflowVersionState> versionStates = null;

    public void setVersionState(String value) {
        this.versionStates = formatString(value);
    }

    public void setState(String value) {
        this.versionStates = formatString(value);
    }

    private static Set<WorkflowVersionState> formatString(String value) {
        try {
            return value == null ? null : Arrays.stream(value.split(",")).map(WorkflowVersionState::valueOf)
                                                .collect(Collectors.toSet());
        } catch (Exception ignore) {
            LOGGER.info(
                    "value is invalid and cannot be formatted to a set of version states, therefore it set to empty set");
            return Collections.emptySet();
        }
    }
}
