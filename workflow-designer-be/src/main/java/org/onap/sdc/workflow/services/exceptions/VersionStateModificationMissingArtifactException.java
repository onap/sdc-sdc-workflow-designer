/*-
 * ============LICENSE_START=======================================================
 * SDC
 * ================================================================================
 * Copyright (C) 2019 AT&T Intellectual Property. All rights reserved.
 * ================================================================================
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
 * ============LICENSE_END=========================================================
 */

package org.onap.sdc.workflow.services.exceptions;

import org.onap.sdc.workflow.services.types.WorkflowVersionState;

public class VersionStateModificationMissingArtifactException extends RuntimeException {

    public static final String WORKFLOW_MODIFICATION_STATE_MISSING_ARTIFACT_TEMPLATE =
            "Workflow %s, version %s: state can not be changed from %s to %s. Missing artifact";

    public VersionStateModificationMissingArtifactException(String workflowId, String versionId,
                                                            WorkflowVersionState sourceState,
                                                            WorkflowVersionState targetState) {
        super(String.format(WORKFLOW_MODIFICATION_STATE_MISSING_ARTIFACT_TEMPLATE, workflowId, versionId,
                sourceState.name(), targetState.name()));
    }
}
