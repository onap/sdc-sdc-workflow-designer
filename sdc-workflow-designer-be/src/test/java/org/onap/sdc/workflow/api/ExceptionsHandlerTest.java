/*
 * Copyright © 2016-2018 European Support Limited
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
import org.onap.sdc.workflow.services.exceptions.VersionStateModificationMissingArtifactException;
import org.onap.sdc.workflow.services.types.WorkflowVersionState;
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
    public void handleUnprocessableEntityVersionStateModificationMissingArtifactException() {
        VersionStateModificationMissingArtifactException exception =
                new VersionStateModificationMissingArtifactException("WF_ID", "Version_id",
                        WorkflowVersionState.DRAFT, WorkflowVersionState.CERTIFIED);
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
