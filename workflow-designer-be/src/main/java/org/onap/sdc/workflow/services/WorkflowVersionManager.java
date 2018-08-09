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

package org.onap.sdc.workflow.services;

import java.util.Collection;
import java.util.Set;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.services.types.WorkflowVersion;
import org.onap.sdc.workflow.services.types.WorkflowVersionState;
import org.springframework.web.multipart.MultipartFile;


public interface WorkflowVersionManager {

    Collection<WorkflowVersion> list(String workflowId, Set<WorkflowVersionState> stateFilter);

    WorkflowVersion create(String workflowId, String baseVersionId, WorkflowVersion version);

    void update(String workflowId, WorkflowVersion version);

    WorkflowVersion get(String workflowId, String versionId);

    WorkflowVersionState getState(String workflowId, String versionId);

    void updateState(String workflowId, String versionId, WorkflowVersionState state);

    ArtifactEntity getArtifact(String workflowId, String versionId);

    void deleteArtifact(String workflowId, String versionId);

    void uploadArtifact(String workflowId, String versionId, MultipartFile artifact);
}