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
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.Getter;
import org.onap.sdc.workflow.services.types.Sort;

@Getter
public class Sorting {

    private static final String SORTS_DELIMITER = ",";
    private static final String DIRECTION_DELIMITER = ":";
    private static final String ASCENDING_ORDER = "asc";

    private List<Sort> sorts = Collections.emptyList();

    public void setSort(String sortString) {
        this.sorts = Arrays.stream(sortString.split(SORTS_DELIMITER)).map(Sorting::formatSort).filter(Objects::nonNull)
                           .collect(Collectors.toList());
    }

    private static Sort formatSort(String sort) {
        String[] tokens = sort.split(DIRECTION_DELIMITER);
        try {
            return new Sort(tokens[0], ASCENDING_ORDER.equalsIgnoreCase(tokens[1]));
        } catch (Exception e) {
            return null;
        }
    }
}
