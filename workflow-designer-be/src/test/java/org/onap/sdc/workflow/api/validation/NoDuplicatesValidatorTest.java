package org.onap.sdc.workflow.api.validation;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collection;
import javax.validation.ConstraintValidatorContext;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;

public class NoDuplicatesValidatorTest {

    class AnnotationWrapper {

        @NoDuplicates
        public WorkflowVersion workflowVersion;
    }

    NoDuplicatesValidator ioValidator;

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
        ioValidator = initializeValidator(AnnotationWrapper.class);
    }

    @Test
    public void shouldFailIfWFVersionHave2InputsWithTheSameName() {
        WorkflowVersion workflowVersion = new WorkflowVersion();
        Collection<ParameterEntity> inputs =
                Arrays.asList(createParameterEntity("name1"), createParameterEntity("name1"));
        workflowVersion.setInputs(inputs);

        assertFalse(ioValidator.isValid(workflowVersion, context));
    }

    @Test
    public void shouldPassIfWFVersionHave2InputsWithDifferentNames() {
        WorkflowVersion workflowVersion = new WorkflowVersion();
        Collection<ParameterEntity> inputs =
                Arrays.asList(createParameterEntity("name2"), createParameterEntity("name1"));
        workflowVersion.setInputs(inputs);

        assertTrue(ioValidator.isValid(workflowVersion, context));
    }

    @Test
    public void shouldFailIfWFVersionHave2OutputsWithTheSameName() {
        WorkflowVersion workflowVersion = new WorkflowVersion();
        Collection<ParameterEntity> outputs =
                Arrays.asList(createParameterEntity("name1"), createParameterEntity("name1"));
        workflowVersion.setOutputs(outputs);

        assertFalse(ioValidator.isValid(workflowVersion, context));
    }

    @Test
    public void shouldPassIfWFVersionHave2OutputsWithDifferentNames() {
        WorkflowVersion workflowVersion = new WorkflowVersion();
        Collection<ParameterEntity> outputs =
                Arrays.asList(createParameterEntity("name2"), createParameterEntity("name1"));
        workflowVersion.setOutputs(outputs);

        assertTrue(ioValidator.isValid(workflowVersion, context));
    }

    private NoDuplicatesValidator initializeValidator(Class<?> classWithAnnotation) throws NoSuchFieldException {
        NoDuplicates constraint = classWithAnnotation.getField("workflowVersion").getAnnotation(NoDuplicates.class);
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