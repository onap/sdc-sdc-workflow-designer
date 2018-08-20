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
import java.util.Set;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import lombok.Data;


@Data
public class Workflow {

    private String id;
    @NotBlank(message = "Workflow name may not be blank")
    @Size(min = 6,max = 80, message = "Workflow name must be at least 6 characters, and no more than 80 characters")
    @Pattern(regexp = "[A-Za-z0-9_ ]+", message = "Workflow name must contain only letters, digits and underscores")
    private String name;
    private String description;
    private Set<WorkflowVersionState> versionStates;
    private Collection<WorkflowVersion> versions;
}
