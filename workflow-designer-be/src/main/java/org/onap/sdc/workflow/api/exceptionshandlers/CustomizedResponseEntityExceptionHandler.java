package org.onap.sdc.workflow.api.exceptionshandlers;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.InvalidArtifactException;
import org.onap.sdc.workflow.services.exceptions.UniqueValueViolationException;
import org.onap.sdc.workflow.services.exceptions.CreateVersionException;
import org.onap.sdc.workflow.services.exceptions.VersionModificationException;
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

    @ExceptionHandler(EntityNotFoundException.class)
    public final ResponseEntity<String> handleWorkflowNotFoundException(
            Exception exception) {
        return new ResponseEntity<>(exception.getMessage(), NOT_FOUND);
    }

    @ExceptionHandler({InvalidArtifactException.class, VersionModificationException.class})
    public final ResponseEntity<String> handleInvalidArtifactException(
            Exception exception) {
        return new ResponseEntity<>(exception.getMessage(), UNPROCESSABLE_ENTITY);
    }


    @ExceptionHandler(CreateVersionException.class)
    public final ResponseEntity<String> handleVersioningErrorException(
            CreateVersionException exception) {
        return new ResponseEntity<>(exception.getMessage(), FORBIDDEN);
    }
}
