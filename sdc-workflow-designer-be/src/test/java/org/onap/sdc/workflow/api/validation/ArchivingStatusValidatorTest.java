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

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import javax.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
public class ArchivingStatusValidatorTest {

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

    private ArchivingStatusValidator validator;

    @BeforeEach
    public void setup() throws NoSuchFieldException {
        MockitoAnnotations.initMocks(this);
        when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(constraintViolationBuilder);
        when(constraintViolationBuilder.addPropertyNode(anyString())).thenReturn(nodeBuilderCustomizableContext);
        validator = initializeValidator(ArchivingStatusValidatorTest.AnnotationWrapper.class);
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




  private ArchivingStatusValidator initializeValidator(Class<?> classWithAnnotation)
            throws NoSuchFieldException {
        ValidStatus constraint = classWithAnnotation.getField("status").getAnnotation(ValidStatus.class);
        ArchivingStatusValidator validator = new ArchivingStatusValidator();
        validator.initialize(constraint);
        return validator;
    }


}
