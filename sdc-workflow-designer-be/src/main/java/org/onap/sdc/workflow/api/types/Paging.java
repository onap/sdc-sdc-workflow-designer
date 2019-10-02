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

import static org.onap.sdc.workflow.services.types.PagingConstants.MAX_LIMIT;

import java.util.Optional;
import lombok.Getter;

@Getter
public class Paging {

    private Integer offset;
    private Integer limit;

    public void setOffset(String offset) {
        getIntValue(offset).ifPresent(integer -> this.offset = integer);
    }

    public void setLimit(String limit) {
        getIntValue(limit).map(integer -> integer > MAX_LIMIT ? MAX_LIMIT : integer).ifPresent(integer -> {
            if (integer != 0) {
                this.limit = integer;
            }
        });
    }

    private static Optional<Integer> getIntValue(String value) {
        try {
            int intValue = Integer.parseInt(value);
            return intValue < 0 ? Optional.empty() : Optional.of(intValue);
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
