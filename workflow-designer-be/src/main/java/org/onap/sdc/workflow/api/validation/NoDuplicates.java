package org.onap.sdc.workflow.api.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import javax.validation.Constraint;
import javax.validation.Payload;

@Target({ElementType.TYPE, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = {NoDuplicatesValidator.class})
public @interface NoDuplicates {
    String message();

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
