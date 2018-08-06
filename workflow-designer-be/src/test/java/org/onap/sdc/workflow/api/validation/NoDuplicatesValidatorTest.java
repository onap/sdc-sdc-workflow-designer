package org.onap.sdc.workflow.api.validation;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import javax.validation.ConstraintValidatorContext;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;

public class NoDuplicatesValidatorTest {

    class AnnotationWrapper {

        @NoDuplicates(message = "test message")
        public Collection<ParameterEntity> collection;
    }

    private NoDuplicatesValidator noDuplicatesValidator;

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
        noDuplicatesValidator = initializeValidator(AnnotationWrapper.class);
    }

    @Test
    public void shouldFailIfCollectionHaveMoreThen1ParameterEntityWithSameName() {
        Collection<ParameterEntity> inputs =
                Arrays.asList(createParameterEntity("name1"), createParameterEntity("name1"));

        assertFalse(noDuplicatesValidator.isValid(inputs, context));
    }

    @Test
    public void shouldPassIfCollectionDontHaveMoreThen1ParameterEntityWithSameName() {
        Collection<ParameterEntity> inputs =
                Arrays.asList(createParameterEntity("name2"), createParameterEntity("name1"));

        assertTrue(noDuplicatesValidator.isValid(inputs, context));
    }

    @Test
    public void shouldPassIfCollectionContainsOnlyOneObject() {
        Collection<ParameterEntity> inputs =
                Arrays.asList(createParameterEntity("name2"));

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

    private ParameterEntity createParameterEntity(String name) {
        ParameterEntity parameterEntity = new ParameterEntity();
        parameterEntity.setName(name);
        return parameterEntity;
    }
}