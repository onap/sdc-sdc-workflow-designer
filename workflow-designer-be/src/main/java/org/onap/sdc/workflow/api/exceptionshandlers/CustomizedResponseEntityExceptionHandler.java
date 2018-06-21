package org.onap.sdc.workflow.api.exceptionshandlers;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

import org.onap.sdc.workflow.services.Exceptions.UniqueValueViolationException;
import org.onap.sdc.workflow.services.Exceptions.WorkflowNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
@RestController
public class CustomizedResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(UniqueValueViolationException.class)
    public final ResponseEntity<String> handleUniqueValueViolationException(
            UniqueValueViolationException exception) {
        return new ResponseEntity<>(exception.getMessage(), UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(WorkflowNotFoundException.class)
    public final ResponseEntity<String> handleWorkflowNotFoundException(
            WorkflowNotFoundException exception) {
        return new ResponseEntity<>(exception.getMessage(), NOT_FOUND);
    }
}
