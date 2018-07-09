package org.onap.sdc.workflow.api.exceptionshandlers;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

import org.onap.sdc.workflow.api.exceptions.InvalidPaginationParameterException;
import org.onap.sdc.workflow.services.exceptions.UniqueValueViolationException;
import org.onap.sdc.workflow.services.exceptions.VersionNotFoundException;
import org.onap.sdc.workflow.services.exceptions.WorkflowNotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
@RestController
public class CustomizedResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(UniqueValueViolationException.class)
    public final ResponseEntity<String> handleUniqueValueViolationException(
            UniqueValueViolationException exception) {
        return new ResponseEntity<>(exception.getMessage(), UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler({WorkflowNotFoundException.class, VersionNotFoundException.class})
    public final ResponseEntity<String> handleWorkflowNotFoundException(
            Exception exception) {
        return new ResponseEntity<>(exception.getMessage(), NOT_FOUND);
    }

    @ExceptionHandler({InvalidPaginationParameterException.class})
    public final ResponseEntity<String> handlePaginationException(InvalidPaginationParameterException exception) {
        return new ResponseEntity<>(exception.getMessage(), BAD_REQUEST);
    }

    //For missing header exceptions
    @Override
    public ResponseEntity<Object> handleServletRequestBindingException(ServletRequestBindingException ex,
                                                                       HttpHeaders headers, HttpStatus status,
                                                                       WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), BAD_REQUEST);
    }
}
