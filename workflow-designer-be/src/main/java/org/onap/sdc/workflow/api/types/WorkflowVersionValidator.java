package org.onap.sdc.workflow.api.types;

import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.services.exceptions.VersionValidationException;
import org.springframework.stereotype.Component;

@Component("WorkflowVersionValidator")
public class WorkflowVersionValidator {

    public void validate(String workflowId, WorkflowVersion workflowVersion) {

        if(containsDuplicates( workflowVersion.getInputs())){
            throw new VersionValidationException(workflowId,"Input name must be unique");

        }

        if(containsDuplicates(workflowVersion.getOutputs())){
            throw new VersionValidationException(workflowId ,"Output name must be unique");
        }
    }

    private boolean containsDuplicates(Collection<ParameterEntity> parameters){
        if(Objects.isNull(parameters) ||  parameters.size() < 2 ) {
            return false;
        }
        Set<String> testSet = new HashSet<>();
        return parameters.stream().anyMatch(s -> !testSet.add(s.getName()));
    }
}
