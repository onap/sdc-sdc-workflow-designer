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
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;

@Getter
public class Sorting {

    private static final String SORTS_DELIMITER = ",";
    private static final String DIRECTION_DELIMITER = ":";
    private static final String ASC = "asc";
    private static final String DESC = "desc";
    private static final Logger LOGGER = LoggerFactory.getLogger(Sorting.class);

    private List<Sort> sorts = Collections.emptyList();

    public void setSort(String sortString) {
        this.sorts = Arrays.stream(sortString.split(SORTS_DELIMITER))
                             .map(Sorting::formatSort)
                             .filter(Objects::nonNull)
                             .collect(Collectors.toList());
    }

    private static Sort formatSort(String sort) {
        String[] tokens = sort.split(DIRECTION_DELIMITER, 2);

        return tokens.length == 2
                       ? formatSingleSort(tokens[0], tokens[1])
                       : new Sort(tokens[0], true);
    }

    private static Sort formatSingleSort(String property, String direction) {
        if (ASC.equalsIgnoreCase(direction)) {
            return new Sort(property, true);
        }
        if (DESC.equalsIgnoreCase(direction)) {
            return new Sort(property, false);
        }
        LOGGER.warn("Sorting direction {} of property {} is invalid. Allowed direction values: asc, desc.", direction,
                property);
        return null;
    }
}
