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

package org.onap.sdc.workflow.api;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

import java.util.function.Function;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.commons.text.RandomStringGenerator;
import org.onap.sdc.workflow.api.types.ErrorResponse;
import org.onap.sdc.workflow.api.types.UnexpectedErrorResponse;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.InvalidArtifactException;
import org.onap.sdc.workflow.services.exceptions.UniqueValueViolationException;
import org.onap.sdc.workflow.services.exceptions.VersionCreationException;
import org.onap.sdc.workflow.services.exceptions.VersionModificationException;
import org.onap.sdc.workflow.services.exceptions.VersionStateModificationException;
import org.onap.sdc.workflow.services.exceptions.VersionStatusModificationException;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
@RestController
public class ExceptionsHandler extends ResponseEntityExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExceptionsHandler.class);
    private static final String LOG_MSG = "Exception was mapped to {} response";
    private static final String UNEXPECTED_ERROR_MSG = "Something bad happened. Please contact support with code %s";
    private static final RandomStringGenerator CODE_GENERATOR =
            new RandomStringGenerator.Builder().withinRange('A', 'Z').build();
    private static final int CODE_LENGTH = 8;

    private static final Function<Exception, UnexpectedErrorResponse> UNEXPECTED_EXCEPTION_MAPPER =
            isDevInfoDisabled()
                    ? e -> new UnexpectedErrorResponse(getUnexpectedErrorMessage())
                    : e -> new UnexpectedErrorResponse(getUnexpectedErrorMessage(), ExceptionUtils.getStackTrace(e));

    @Override
    public ResponseEntity<Object> handleServletRequestBindingException(ServletRequestBindingException ex,
            HttpHeaders headers, HttpStatus status, WebRequest request) {
        //For missing header exceptions
        LOGGER.debug(LOG_MSG, BAD_REQUEST, ex);
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage()), BAD_REQUEST);
    }

    @Override
    protected final ResponseEntity<Object> handleMethodArgumentNotValid(final MethodArgumentNotValidException exception,
            final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
        LOGGER.debug(LOG_MSG, BAD_REQUEST, exception);
        String errorMsg = exception.getBindingResult().getFieldErrors().stream()
                                  .map(DefaultMessageSourceResolvable::getDefaultMessage).findFirst()
                                  .orElse(exception.getMessage());
        return new ResponseEntity<>(new ErrorResponse(errorMsg), BAD_REQUEST);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public final ResponseEntity<ErrorResponse> handleNotFoundException(Exception exception) {
        LOGGER.debug(LOG_MSG, NOT_FOUND, exception);
        return new ResponseEntity<>(new ErrorResponse(exception.getMessage()), NOT_FOUND);
    }

    @ExceptionHandler(
            {InvalidArtifactException.class, VersionCreationException.class, VersionModificationException.class,
                    VersionStateModificationException.class, VersionStatusModificationException.class,
                    UniqueValueViolationException.class})
    public final ResponseEntity<ErrorResponse> handleUnprocessableEntityException(Exception exception) {
        LOGGER.debug(LOG_MSG, UNPROCESSABLE_ENTITY, exception);
        return new ResponseEntity<>(new ErrorResponse(exception.getMessage()), UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(Exception.class)
    public final ResponseEntity<UnexpectedErrorResponse> handleUnexpectedException(Exception exception) {
        UnexpectedErrorResponse response = UNEXPECTED_EXCEPTION_MAPPER.apply(exception);
        LOGGER.error(response.getMessage(), exception);
        return new ResponseEntity<>(response, INTERNAL_SERVER_ERROR);
    }

    private static boolean isDevInfoDisabled() {
        return Boolean.FALSE.toString().equalsIgnoreCase(System.getProperty("errors.includeDevInfo"));
    }

    private static String getUnexpectedErrorMessage() {
        return String.format(UNEXPECTED_ERROR_MSG, CODE_GENERATOR.generate(CODE_LENGTH));
    }
}
