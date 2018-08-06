package org.onap.sdc.workflow.api.validation;

import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;

public class NoDuplicatesValidator
        implements ConstraintValidator<NoDuplicates, WorkflowVersion> {

    @Override
    public boolean isValid(WorkflowVersion workflowVersion, ConstraintValidatorContext context) {
        context.disableDefaultConstraintViolation();

        return isValid(context, workflowVersion.getInputs(), "inputs")
                       && isValid(context, workflowVersion.getOutputs(), "outputs");
    }

    private boolean isValid(ConstraintValidatorContext context, Collection<ParameterEntity> inputs,
            String parameterName) {
        String messageTemplate = "%s names must be unique";
        if (containsDuplicates(inputs)) {
            context.buildConstraintViolationWithTemplate(String.format(messageTemplate, parameterName))
                   .addPropertyNode(parameterName).addConstraintViolation();
            return false;
        }
        return true;
    }

    private boolean containsDuplicates(Collection<ParameterEntity> parameters) {
        if (Objects.isNull(parameters) || parameters.size() < 2) {
            return false;
        }
        Set<String> testSet = new HashSet<>();
        return parameters.stream().anyMatch(s -> !testSet.add(s.getName()));
    }
}
