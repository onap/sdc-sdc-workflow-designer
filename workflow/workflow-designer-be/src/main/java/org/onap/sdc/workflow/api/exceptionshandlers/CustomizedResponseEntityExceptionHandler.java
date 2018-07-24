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

package org.onap.sdc.workflow.api.exceptionshandlers;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.InvalidArtifactException;
import org.onap.sdc.workflow.services.exceptions.InvalidPaginationParameterException;
import org.onap.sdc.workflow.services.exceptions.UniqueValueViolationException;
import org.onap.sdc.workflow.services.exceptions.VersionCreationException;
import org.onap.sdc.workflow.services.exceptions.VersionModificationException;
import org.onap.sdc.workflow.services.exceptions.VersionStateModificationException;
import org.openecomp.core.utilities.json.JsonUtil;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
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

    @ExceptionHandler(EntityNotFoundException.class)
    public final ResponseEntity<String> handleWorkflowNotFoundException(
            Exception exception) {
        return new ResponseEntity<>(exception.getMessage(), NOT_FOUND);
    }

    @ExceptionHandler({InvalidPaginationParameterException.class})
    public final ResponseEntity<String> handlePaginationException(InvalidPaginationParameterException exception) {
        return new ResponseEntity<>(exception.getMessage(), BAD_REQUEST);
    }

    //For workflowVersionValidator exception
    @Override
    protected final ResponseEntity<Object> handleMethodArgumentNotValid(final MethodArgumentNotValidException e,
            final HttpHeaders headers,
            final HttpStatus status,
            final WebRequest request) {

        FieldError result = e.getBindingResult().getFieldError();
        String rejectedArguments = JsonUtil.object2Json(result.getArguments()[0]);

       return new ResponseEntity<>(result.getDefaultMessage() + "\n" + rejectedArguments, BAD_REQUEST);
    }

    //For missing header exceptions
    @Override
    public ResponseEntity<Object> handleServletRequestBindingException(ServletRequestBindingException ex,
                                                                       HttpHeaders headers, HttpStatus status,
                                                                       WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), BAD_REQUEST);
    }


    @ExceptionHandler({InvalidArtifactException.class, VersionModificationException.class,
            VersionStateModificationException.class})
    public final ResponseEntity<String> handleInvalidArtifactException(
            Exception exception) {
        return new ResponseEntity<>(exception.getMessage(), UNPROCESSABLE_ENTITY);
    }


    @ExceptionHandler(VersionCreationException.class)
    public final ResponseEntity<String> handleVersioningErrorException(
            VersionCreationException exception) {
        return new ResponseEntity<>(exception.getMessage(), FORBIDDEN);
    }
}
