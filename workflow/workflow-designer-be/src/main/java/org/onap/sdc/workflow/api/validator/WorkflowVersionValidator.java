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

package org.onap.sdc.workflow.api.validator;

import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;


@Component("workflowVersionValidator")
public class WorkflowVersionValidator implements Validator{

    @Override
    public boolean supports(Class<?> aClass) {
        return WorkflowVersion.class.equals(aClass);
    }

    @Override
    public void validate(Object o, Errors errors) {

        WorkflowVersion workflowVersion = (WorkflowVersion) o;
        Collection<ParameterEntity> inputs = workflowVersion.getInputs();
        Collection<ParameterEntity> outputs = workflowVersion.getOutputs();

        if(containsDuplicates(inputs)){
            errors.rejectValue("inputs", "duplicateName", new Object[] {inputs}, "Input name must be unique");
        }

        if(containsDuplicates(outputs)){
            errors.rejectValue("outputs", "duplicateName", new Object[] {outputs}, "Output name must be unique");
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
