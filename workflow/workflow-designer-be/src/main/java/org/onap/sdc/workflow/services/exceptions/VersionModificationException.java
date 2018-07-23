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

public class VersionModificationException extends RuntimeException {

    public VersionModificationException(String workflowId, String versionId) {
        super(String.format(
            "Error while trying to modify version %s of workflow %s: Version is CERTIFIED and can not be edited",
            versionId, workflowId));
    }
}