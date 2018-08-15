package org.onap.sdc.workflow.api;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.onap.sdc.workflow.api.types.ErrorResponse;
import org.onap.sdc.workflow.api.types.UnexpectedErrorResponse;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.VersionModificationException;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
public class ExceptionsHandlerTest {

    @InjectMocks
    private ExceptionsHandler exceptionsHandler;

    @Test
    public void handleNotFoundException() {
        EntityNotFoundException exception = new EntityNotFoundException("message");
        ResponseEntity<ErrorResponse> response = exceptionsHandler.handleNotFoundException(exception);

        assertEquals(NOT_FOUND, response.getStatusCode());
        assertEquals(exception.getMessage(), response.getBody().getMessage());
    }

    @Test
    public void handleUnprocessableEntityException() {
        VersionModificationException exception = new VersionModificationException("1", "2");
        ResponseEntity<ErrorResponse> response = exceptionsHandler.handleUnprocessableEntityException(exception);

        assertEquals(UNPROCESSABLE_ENTITY, response.getStatusCode());
        assertEquals(exception.getMessage(), response.getBody().getMessage());
    }

    @Test
    public void handleUnexpectedException() {
        Exception exception = new Exception("message");
        ResponseEntity<UnexpectedErrorResponse> response = exceptionsHandler.handleUnexpectedException(exception);

        assertEquals(INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody().getMessage());
        assertFalse(response.getBody().getMessage().contains(exception.getMessage()));
        assertNotNull(response.getBody().getDevInfo());
    }
}