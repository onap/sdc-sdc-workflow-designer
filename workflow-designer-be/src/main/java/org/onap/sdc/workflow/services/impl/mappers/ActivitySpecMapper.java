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

import static org.onap.sdc.workflow.services.ActivitySpecConstant.CATEGORY_ATTRIBUTE_NAME;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.onap.sdc.workflow.persistence.types.ActivitySpecEntity;
import org.onap.sdc.workflow.services.ActivitySpecConstant;
import org.onap.sdc.workflow.services.impl.ItemType;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;
import org.openecomp.sdc.versioning.types.Item;

@Mapper(componentModel = "spring", imports = {ItemType.class, ActivitySpecConstant.class})
public interface ActivitySpecMapper {

    @Mappings({@Mapping(source = "versionStatusCounters", target = "status"),
            @Mapping(source = "properties", target = "categoryList")})
    ActivitySpecEntity itemToActivitySpec(Item item);

    @InheritInverseConfiguration
    @Mappings({@Mapping(expression = "java(ItemType.ACTIVITYSPEC.name())", target = "type"),
            @Mapping(target = "versionStatusCounters", ignore = true), @Mapping(target = "status", ignore = true),
            @Mapping(source = "categoryList", target = "properties")})
    Item activitySpecToItem(ActivitySpecEntity activitySpec);

    default String versionStatusCountersToStatus(Map<VersionStatus, Integer> versionStatusCounters) {
        return versionStatusCounters.keySet().stream().findFirst().map(Enum::name).orElse(null);
    }

    default Map<String, Object> categoriesToProperties(List<String> categories) {
        Map<String, Object> properties = new HashMap<>();
        properties.put(CATEGORY_ATTRIBUTE_NAME, categories);
        return properties;
    }

    default List<String> propertiesToCategories(Map<String, Object> properties) {
        return (List<String>) properties.get(CATEGORY_ATTRIBUTE_NAME);
    }
}
