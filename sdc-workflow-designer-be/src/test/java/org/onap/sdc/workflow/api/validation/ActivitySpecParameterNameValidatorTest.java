/*
 * Copyright © 2016-2018 European Support Limited
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

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import javax.validation.ConstraintValidatorContext;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.onap.sdc.workflow.persistence.types.ActivitySpecParameter;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
public class ActivitySpecParameterNameValidatorTest {

    class AnnotationWrapper {

        @ValidName(message = "test message")
        public ActivitySpecParameter parameter;
    }

    private String noSpacesMessage = "Input and output names must not contain any spaces";
    private String matchPatternMessage = "Input and output names must match the validation pattern";

    @Mock
    private ConstraintValidatorContext context;
    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder constraintViolationBuilder;
    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder.NodeBuilderCustomizableContext nodeBuilderCustomizableContext;

    private ActivitySpecParameterNameValidator validator;


    @Before
    public void setup() throws NoSuchFieldException {
        MockitoAnnotations.initMocks(this);
        when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(constraintViolationBuilder);
        when(constraintViolationBuilder.addPropertyNode(anyString())).thenReturn(nodeBuilderCustomizableContext);
        validator = initializeValidator(ActivitySpecParameterNameValidatorTest.AnnotationWrapper.class);
    }

    @Test
    public void shouldPassIfNoSpaces() {
        validator.setValidationRegex("^\\S*$");
        assertTrue(validator.isValid(createParameter("validName"), context));
    }

    @Test
    public void shouldFailIfNameHasSpaces() {
        validator.setValidationRegex("^\\S*$");
        validator.setValidationMessage(noSpacesMessage);
        assertFalse(validator.isValid(createParameter("not a valid name"), context));
        verify(context).disableDefaultConstraintViolation();
        verify(context).buildConstraintViolationWithTemplate(noSpacesMessage);
    }


    @Test
    public void shouldFailIfNameHasSpacesInStart() {
        validator.setValidationRegex("^\\S*$");
        validator.setValidationMessage(noSpacesMessage);
        assertFalse(validator.isValid(createParameter("  name"), context));
        verify(context).disableDefaultConstraintViolation();
        verify(context).buildConstraintViolationWithTemplate(noSpacesMessage);
    }

    @Test
    public void shouldFailIfNameHasSpacesInEnd() {
        validator.setValidationRegex("^\\S*$");
        validator.setValidationMessage(noSpacesMessage);
        assertFalse(validator.isValid(createParameter("name    "), context));
        verify(context).disableDefaultConstraintViolation();
        verify(context).buildConstraintViolationWithTemplate(noSpacesMessage);
    }

    @Test
    public void shouldFailIfDoesNotMatchRegex() {
        validator.setValidationRegex("^[a-zA-Z0-9-]*$");
        validator.setValidationMessage(matchPatternMessage);
        assertFalse(validator.isValid(createParameter("NotValid$$##"), context));
        verify(context).disableDefaultConstraintViolation();
        verify(context).buildConstraintViolationWithTemplate(matchPatternMessage);
    }

    @Test
    public void shouldPassIfMatchRegex() {
        validator.setValidationRegex("^[a-zA-Z0-9-]*$");
        assertTrue(validator.isValid(createParameter("validName"), context));
    }

    private ActivitySpecParameterNameValidator initializeValidator(Class<?> classWithAnnotation)
            throws NoSuchFieldException {
        ValidName constraint = classWithAnnotation.getField("parameter").getAnnotation(ValidName.class);
        ActivitySpecParameterNameValidator validator = new ActivitySpecParameterNameValidator();
        validator.initialize(constraint);
        return validator;
    }

    private ActivitySpecParameter createParameter(String name) {
        ActivitySpecParameter parameter = new ActivitySpecParameter();
        parameter.setName(name);
        parameter.setValue("value");
        parameter.setType("type");
        return parameter;
    }
}
