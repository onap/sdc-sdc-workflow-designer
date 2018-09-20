package org.onap.sdc.workflow.api.validation;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.verify;

import javax.validation.ConstraintValidatorContext;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.onap.sdc.workflow.persistence.types.ActivitySpecParameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
public class ActivitySpecParameterNameValidatorTest {

    private String noSpacesMessage = "Input and output names must not contain any spaces";
    private String matchPatternMessage = "Input and output names must match the validation pattern";

    private ConstraintValidatorContext context;
    private ConstraintValidatorContext.ConstraintViolationBuilder builder;

    @Autowired
    private ActivitySpecParameterNameValidator validator;


    @Before
    public void setup() {
        context = Mockito.mock(ConstraintValidatorContext.class);
        builder = Mockito.mock(ConstraintValidatorContext.ConstraintViolationBuilder.class);
        Mockito.when(context.buildConstraintViolationWithTemplate(Mockito.anyString()))
               .thenReturn(builder);
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

    private ActivitySpecParameter createParameter(String name) {
        ActivitySpecParameter parameter = new ActivitySpecParameter();
        parameter.setName(name);
        parameter.setValue("value");
        parameter.setType("type");
        return parameter;
    }
}
