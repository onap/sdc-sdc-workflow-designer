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
import org.onap.sdc.common.versioning.services.convertors.ItemConvertor;
import org.onap.sdc.common.versioning.services.types.Item;
import org.onap.sdc.workflow.services.impl.ItemType;
import org.onap.sdc.workflow.services.types.Workflow;

@Mapper(componentModel = "spring", imports = ItemType.class,
        uses = {VersionStateMapper.class, ArchivingStatusMapper.class})
public interface WorkflowMapper extends ItemConvertor<Workflow> {

    @Override
    default String getItemType() {
        return ItemType.WORKFLOW.name();
    }

    @Override
    @Mapping(source = "versionStatusCounters", target = "versionStates")
    @Mapping(source = "status", target = "archiving")
    Workflow fromItem(Item item);

    @Override
    @InheritInverseConfiguration
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "versionStatusCounters", ignore = true)
    @Mapping(expression = "java(ItemType.WORKFLOW.name())", target = "type")
    void toItem(Workflow workflow, @MappingTarget Item item);

}
