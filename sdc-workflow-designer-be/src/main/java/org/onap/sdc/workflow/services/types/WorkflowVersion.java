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

package org.onap.sdc.workflow.services.types;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;


@Data
@NoArgsConstructor
public class WorkflowVersion {

    private String id;
    private String name;
    private String description;
    private String baseId;
    private WorkflowVersionState state;
    private Collection<ParameterEntity> inputs = Collections.emptyList();
    private Collection<ParameterEntity> outputs = Collections.emptyList();
    private boolean hasArtifact;
    private Date creationTime;
    private Date modificationTime;

    public WorkflowVersion(String id) {
        this.id = id;
        this.state = WorkflowVersionState.DRAFT;
    }
}
