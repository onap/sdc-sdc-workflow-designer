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

package org.onap.sdc.workflow.api.validation;

import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import org.onap.sdc.workflow.persistence.types.ActivitySpecParameter;
import org.springframework.beans.factory.annotation.Value;

public class ActivitySpecParameterNameValidator implements ConstraintValidator<ValidName, ActivitySpecParameter> {

    private String validationRegex;
    private String defaultValidationRegex = "^\\S*$";
    @Value("${activitySpec.parameterName.validationMessage}")
    private String validationMessage;

    @Override
    public boolean isValid(ActivitySpecParameter parameter, ConstraintValidatorContext context) {
        Pattern pattern = Pattern.compile(validationRegex);
        Matcher matcher = pattern.matcher(parameter.getName());
        boolean isValid = matcher.find();
        if (!isValid && !validationRegex.equals(defaultValidationRegex)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(validationMessage).addConstraintViolation();
        }
        return isValid;
    }

    @Value("${activitySpec.parameterName.validation}")
    void setValidationRegex(String regex) {
        if (Objects.isNull(regex) || regex.equals(""))
            validationRegex = defaultValidationRegex;
        else validationRegex = regex;
    }
}
