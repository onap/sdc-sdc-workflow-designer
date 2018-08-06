package org.onap.sdc.workflow.api.validation;

import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;

public class NoDuplicatesValidator implements ConstraintValidator<NoDuplicates, Collection<ParameterEntity>> {

    @Override
    public boolean isValid(Collection<ParameterEntity> parameterEntities, ConstraintValidatorContext context) {
        return !containsDuplicates(parameterEntities);
    }

    private boolean containsDuplicates(Collection<ParameterEntity> parameters) {
        if (Objects.isNull(parameters) || parameters.size() < 2) {
            return false;
        }
        Set<String> testSet = new HashSet<>();
        return parameters.stream().anyMatch(s -> !testSet.add(s.getName()));
    }
}
