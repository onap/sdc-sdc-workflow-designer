package org.onap.sdc.workflow.api.validation;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import javax.validation.ConstraintValidatorContext;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.onap.sdc.workflow.api.types.Parameter;

public class NoDuplicatesValidatorTest {

    class AnnotationWrapper {

        @NoDuplicates(message = "test message")
        public Collection<Parameter> collection;
    }

    private NoDuplicatesValidator noDuplicatesValidator;

    @Mock
    private ConstraintValidatorContext context;
    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder constraintViolationBuilder;
    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder.NodeBuilderCustomizableContext
            nodeBuilderCustomizableContext;

    @Before
    public void init() throws NoSuchFieldException {
        MockitoAnnotations.initMocks(this);
        when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(constraintViolationBuilder);
        when(constraintViolationBuilder.addPropertyNode(anyString())).thenReturn(nodeBuilderCustomizableContext);
        noDuplicatesValidator = initializeValidator(AnnotationWrapper.class);
    }

    @Test
    public void shouldFailIfCollectionHaveMoreThen1ParameterEntityWithSameName() {
        Collection<Parameter> inputs = Arrays.asList(createParameter("name1"), createParameter("name1"));

        assertFalse(noDuplicatesValidator.isValid(inputs, context));
    }

    @Test
    public void shouldPassIfCollectionDontHaveMoreThen1ParameterEntityWithSameName() {
        Collection<Parameter> inputs = Arrays.asList(createParameter("name2"), createParameter("name1"));

        assertTrue(noDuplicatesValidator.isValid(inputs, context));
    }

    @Test
    public void shouldPassIfCollectionContainsOnlyOneObject() {
        Collection<Parameter> inputs = Collections.singletonList(createParameter("name2"));

        assertTrue(noDuplicatesValidator.isValid(inputs, context));
    }

    @Test
    public void shouldPassIfCollectionIsNull() {
        assertTrue(noDuplicatesValidator.isValid(null, context));
    }

    @Test
    public void shouldPassIfCollectionIsEmpty() {
        assertTrue(noDuplicatesValidator.isValid(new ArrayList<>(), context));
    }

    private NoDuplicatesValidator initializeValidator(Class<?> classWithAnnotation) throws NoSuchFieldException {
        NoDuplicates constraint = classWithAnnotation.getField("collection").getAnnotation(NoDuplicates.class);
        NoDuplicatesValidator validator = new NoDuplicatesValidator();
        validator.initialize(constraint);
        return validator;
    }

    private Parameter createParameter(String name) {
        Parameter parameter = new Parameter();
        parameter.setName(name);
        return parameter;
    }
}