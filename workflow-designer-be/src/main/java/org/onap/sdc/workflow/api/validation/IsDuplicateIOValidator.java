package org.onap.sdc.workflow.api.validation;

import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;

public class IsDuplicateIOValidator implements ConstraintValidator<IsDuplicateIO, WorkflowVersion> {

    @Override
    public void initialize(IsDuplicateIO constraintAnnotation) {

    }

    @Override
    public boolean isValid(WorkflowVersion workflowVersion, ConstraintValidatorContext context) {
        context.disableDefaultConstraintViolation();

        Collection<ParameterEntity> inputs = workflowVersion.getInputs();
        Collection<ParameterEntity> outputs = workflowVersion.getOutputs();
        boolean isValid = true;
        if(containsDuplicates(inputs)){
            context.buildConstraintViolationWithTemplate("Input name must be unique")
                   .addPropertyNode("inputs").addConstraintViolation();
            isValid = false;
        }

        if(containsDuplicates(outputs)){
            ConstraintValidatorContext.ConstraintViolationBuilder output_name_must_be_unique =
                    context.buildConstraintViolationWithTemplate("Output name must be unique");
            output_name_must_be_unique.addPropertyNode("outputs").addConstraintViolation();
            isValid = false;
        }
        return isValid;
    }

    private boolean containsDuplicates(Collection<ParameterEntity> parameters){
        if(Objects.isNull(parameters) ||  parameters.size() < 2 ) {
            return false;
        }
        Set<String> testSet = new HashSet<>();
        return parameters.stream().anyMatch(s -> !testSet.add(s.getName()));
    }
}
