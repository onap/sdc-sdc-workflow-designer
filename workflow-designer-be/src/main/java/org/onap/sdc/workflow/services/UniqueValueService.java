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

import java.util.Optional;
import org.apache.commons.lang3.ArrayUtils;
import org.onap.sdc.workflow.persistence.UniqueValueRepository;
import org.onap.sdc.workflow.persistence.types.UniqueValueEntity;
import org.onap.sdc.workflow.services.exceptions.UniqueValueViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("uniqueValueService")
public class UniqueValueService {

    private static final String FORMATTED_UNIQUE_VALUE_SEPARATOR = "_";

    private final UniqueValueRepository uniqueValueRepository;

    @Autowired
    public UniqueValueService(UniqueValueRepository uniqueValueRepository) {
        this.uniqueValueRepository = uniqueValueRepository;
    }

    /**
     * Create unique value.
     *
     * @param type              the type
     * @param uniqueCombination the unique combination
     */
    public void createUniqueValue(String type, String... uniqueCombination) {
        formatValue(uniqueCombination).ifPresent(formattedValue -> {
            validateUniqueValue(type, formattedValue, uniqueCombination);
            uniqueValueRepository.insert(new UniqueValueEntity(type, formattedValue));
        });
    }

    /**
     * Delete unique value.
     *
     * @param type              the type
     * @param uniqueCombination the unique combination
     */
    public void deleteUniqueValue(String type, String... uniqueCombination) {
        formatValue(uniqueCombination)
                .ifPresent(formattedValue -> uniqueValueRepository.delete(new UniqueValueEntity(type, formattedValue)));

    }

    /**
     * Update unique value.
     *
     * @param type          the type
     * @param oldValue      the old value
     * @param newValue      the new value
     * @param uniqueContext the unique context
     */
    public void updateUniqueValue(String type, String oldValue, String newValue, String... uniqueContext) {
        if (newValue == null || !newValue.equalsIgnoreCase(oldValue)) {
            createUniqueValue(type, ArrayUtils.addAll(uniqueContext, newValue));
            deleteUniqueValue(type, ArrayUtils.addAll(uniqueContext, oldValue));
        }
    }

    /**
     * Validate unique value.
     *
     * @param type              the type
     * @param uniqueCombination the unique combination
     */
    public void validateUniqueValue(String type, String... uniqueCombination) {
        formatValue(uniqueCombination)
                .ifPresent(formattedValue -> validateUniqueValue(type, formattedValue, uniqueCombination));
    }

    private Optional<String> formatValue(String[] uniqueCombination) {
        if (ArrayUtils.isEmpty(uniqueCombination) || getValueWithoutContext(uniqueCombination) == null) {
            return Optional.empty();
        }

        uniqueCombination[uniqueCombination.length - 1] = getValueWithoutContext(uniqueCombination).toLowerCase();
        return Optional.of(String.join(FORMATTED_UNIQUE_VALUE_SEPARATOR, uniqueCombination));
    }

    private void validateUniqueValue(String type, String formattedValue, String[] uniqueCombination) {
        if (isUniqueValueOccupied(type, formattedValue)) {
            throw new UniqueValueViolationException(type, getValueWithoutContext(uniqueCombination));
        }
    }

    private boolean isUniqueValueOccupied(String type, String formattedValue) {
        return uniqueValueRepository.findById(new UniqueValueEntity(type, formattedValue)).isPresent();
    }

    /**
     * Checks if a unique value is taken.
     *
     * @return true if the unique value is occupied, false otherwise
     */
    public boolean isUniqueValueOccupied(String type, String... uniqueCombination) {
        return formatValue(uniqueCombination).map(formattedValue -> isUniqueValueOccupied(type, formattedValue))
                                             .orElse(false);
    }

    private String getValueWithoutContext(String[] uniqueCombination) {
        return uniqueCombination[uniqueCombination.length - 1];
    }
}
