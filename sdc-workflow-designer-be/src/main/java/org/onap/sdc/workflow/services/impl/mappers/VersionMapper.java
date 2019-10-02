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

package org.onap.sdc.workflow.services.impl.mappers;

import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.onap.sdc.common.versioning.services.convertors.VersionConvertor;
import org.onap.sdc.common.versioning.services.types.Version;
import org.onap.sdc.workflow.services.impl.ItemType;
import org.onap.sdc.workflow.services.types.WorkflowVersion;

@Mapper(componentModel = "spring", uses = VersionStateMapper.class)
public interface VersionMapper extends VersionConvertor<WorkflowVersion> {

    @Override
    default String getItemType(){
        return ItemType.WORKFLOW.name();
    }

    @Override
    @Mapping(source = "status", target = "state")
    WorkflowVersion fromVersion(Version version);

    @Override
    @InheritInverseConfiguration
    @Mapping(target = "status", ignore = true)
    void toVersion(WorkflowVersion workflowVersion, @MappingTarget Version retrievedVersion);

}
