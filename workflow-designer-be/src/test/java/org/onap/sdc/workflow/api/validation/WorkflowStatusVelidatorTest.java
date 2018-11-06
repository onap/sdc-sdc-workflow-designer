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
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
public class WorkflowStatusVelidatorTest {

    class AnnotationWrapper {

        @ValidName(message = "test message")
        public String status;
    }

    @Mock
    private ConstraintValidatorContext context;
    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder constraintViolationBuilder;
    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder.NodeBuilderCustomizableContext nodeBuilderCustomizableContext;

    private WorkflowStatusValidator validator;

    @Before
    public void setup() throws NoSuchFieldException {
        MockitoAnnotations.initMocks(this);
        when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(constraintViolationBuilder);
        when(constraintViolationBuilder.addPropertyNode(anyString())).thenReturn(nodeBuilderCustomizableContext);
        validator = initializeValidator(WorkflowStatusVelidatorTest.AnnotationWrapper.class);
    }

    @Test
    public void shouldFailIfValueIsNull() {
    assertFalse(validator.isValid(null, context));
  }

    @Test
    public void shouldFailIfValueInvalid() {
    assertFalse(validator.isValid("blahblah", context));
  }

    @Test
    public void shouldPassIfValueIsActive() {
    assertTrue(validator.isValid("ACTIVE", context));
  }

    @Test
    public void shouldPassIfValueIsArchived() {
    assertTrue(validator.isValid("ARCHIVED", context));
  }




  private WorkflowStatusValidator initializeValidator(Class<?> classWithAnnotation)
            throws NoSuchFieldException {
        ValidStatus constraint = classWithAnnotation.getField("status").getAnnotation(ValidStatus.class);
        WorkflowStatusValidator validator = new WorkflowStatusValidator();
        validator.initialize(constraint);
        return validator;
    }


}
