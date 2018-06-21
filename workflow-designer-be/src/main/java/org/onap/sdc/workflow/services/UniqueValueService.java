package org.onap.sdc.workflow.services;

import java.util.Optional;
import org.apache.commons.lang.ArrayUtils;
import org.onap.sdc.workflow.persistence.UniqueValueRepository;
import org.onap.sdc.workflow.persistence.types.UniqueValueEntity;
import org.onap.sdc.workflow.services.Exceptions.UniqueValueViolationException;
import org.openecomp.core.utilities.CommonMethods; // todo get rid of
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("uniqueValueService")
public class UniqueValueService {

    private static final char FORMATTED_UNIQUE_VALUE_SEPARATOR = '_';

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
    public void createUniqueValue(String type, String[] uniqueCombination) {
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
    public void deleteUniqueValue(String type, String[] uniqueCombination) {
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
    public void updateUniqueValue(String type, String oldValue, String newValue, String ... uniqueContext) {
        if (newValue == null || !newValue.equalsIgnoreCase(oldValue)) {
            createUniqueValue(type, CommonMethods.concat(uniqueContext, new String[] {newValue}));
            deleteUniqueValue(type, CommonMethods.concat(uniqueContext, new String[] {oldValue}));
        }
    }

    /**
     * Validate unique value.
     *
     * @param type              the type
     * @param uniqueCombination the unique combination
     */
    public void validateUniqueValue(String type, String[] uniqueCombination) {
        formatValue(uniqueCombination)
                .ifPresent(formattedValue -> validateUniqueValue(type, formattedValue, uniqueCombination));
    }

    /**
     * Checks if a unique value is taken.
     *
     * @return true if the unique value is occupied, false otherwise
     */
    public boolean isUniqueValueOccupied(String type, String[] uniqueCombination) {
        return formatValue(uniqueCombination).map(formattedValue -> isUniqueValueOccupied(type, formattedValue))
                                             .orElse(false);
    }

    private void validateUniqueValue(String type, String formattedValue, String[] uniqueCombination) {
        if (isUniqueValueOccupied(type, formattedValue)) {
            throw new UniqueValueViolationException(type, getValueWithoutContext(uniqueCombination));
        }
    }

    private boolean isUniqueValueOccupied(String type, String formattedValue) {
        return uniqueValueRepository.findById(new UniqueValueEntity(type, formattedValue)).isPresent();
    }

    private Optional<String> formatValue(String[] uniqueCombination) {
        if (ArrayUtils.isEmpty(uniqueCombination) || getValueWithoutContext(uniqueCombination) == null) {
            return Optional.empty();
        }

        uniqueCombination[uniqueCombination.length - 1] = getValueWithoutContext(uniqueCombination).toLowerCase();
        return Optional.of(CommonMethods.arrayToSeparatedString(uniqueCombination, FORMATTED_UNIQUE_VALUE_SEPARATOR));
    }

    private String getValueWithoutContext(String[] uniqueCombination) {
        return uniqueCombination[uniqueCombination.length - 1];
    }
}
