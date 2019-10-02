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

package org.onap.sdc.workflow.services.exceptions;

public class VersionCreationException extends RuntimeException {

    private static final String MSG = "Error creating a new version for workflow with id %s";
    private static final String MSG_WITH_BASE_ID = MSG + " based on version %s: %s";

    public VersionCreationException(String workflowId, String baseVersionId, String detailedMessage) {
        super(String.format(MSG_WITH_BASE_ID, workflowId, baseVersionId, detailedMessage));
    }

    public VersionCreationException(String workflowId) {
        super(String.format(MSG, workflowId));
    }
}
