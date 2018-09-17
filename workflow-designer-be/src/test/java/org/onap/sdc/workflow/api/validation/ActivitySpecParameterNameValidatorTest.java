package org.onap.sdc.workflow.api.validation;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import javax.validation.ConstraintValidatorContext;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.onap.sdc.workflow.persistence.types.ActivitySpecParameter;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@TestPropertySource(locations = "classpath:application-test.properties")
public class ActivitySpecParameterNameValidatorTest {

    class AnnotationWrapper {

        @ValidName(message = "test message")
        public ActivitySpecParameter parameter;
    }

    private ActivitySpecParameterNameValidator validator;

    @Mock
    private ConstraintValidatorContext context;
    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder constraintViolationBuilder;
    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder.NodeBuilderCustomizableContext nodeBuilderCustomizableContext;

    @Before
    public void init() throws NoSuchFieldException {
        MockitoAnnotations.initMocks(this);
        when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(constraintViolationBuilder);
        when(constraintViolationBuilder.addPropertyNode(anyString())).thenReturn(nodeBuilderCustomizableContext);
        validator = initializeValidator(ActivitySpecParameterNameValidatorTest.AnnotationWrapper.class);
        validator.setValidationRegex("^\\S*$");
    }

    @Test
    public void shouldPassIfNoSpaces() {
        assertTrue(validator.isValid(createParameter("validName"), context));
    }

    @Test
    public void shouldFailIfNameHasSpaces() {
        assertFalse(validator.isValid(createParameter("not a valid name"), context));
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
