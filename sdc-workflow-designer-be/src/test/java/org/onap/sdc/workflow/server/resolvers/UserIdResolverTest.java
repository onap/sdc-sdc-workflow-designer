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

package org.onap.sdc.workflow.server.resolvers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.onap.sdc.workflow.api.RestParams.USER_ID_HEADER;

import javax.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.onap.sdc.workflow.services.annotations.UserId;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.context.request.NativeWebRequest;

import lombok.SneakyThrows;

/**
 * Tests injection of user ID from HTTP headers.
 *
 * @author evitaliy
 * @since 21 Aug 2018
 */
public class UserIdResolverTest {

    @Test
    public void oneHeaderSelectedWhenMultipleUserIdHeadersSent() throws ServletRequestBindingException {

        final String headerValue = "UserIdValueFromHeader";

        HttpServletRequest servletRequestMock = mock(HttpServletRequest.class);
        when(servletRequestMock.getHeader(USER_ID_HEADER)).thenReturn(headerValue);

        NativeWebRequest webRequestMock = mock(NativeWebRequest.class);
        when(webRequestMock.getNativeRequest(HttpServletRequest.class)).thenReturn(servletRequestMock);

        Object resolved = new UserIdResolver().resolveArgument(null, null, webRequestMock, null);
        assertEquals(headerValue, resolved);
    }

    @Test
    public void illegalTypeErrorThrownWhenAnnotatedParameterIsNotOfTypeString() {
        assertThrows(IllegalStateException.class, () -> {
            MethodParameter methodParameterMock = mock(MethodParameter.class);
            when(methodParameterMock.hasParameterAnnotation(UserId.class)).thenReturn(true);
            //noinspection unchecked
            when(methodParameterMock.getParameterType()).thenReturn((Class) String[].class);
            new UserIdResolver().supportsParameter(methodParameterMock);
        });
    }

    @Test
    @SneakyThrows
    public void missingHeaderErrorThrownWhenUserIdHeaderNotPopulated() {
        NativeWebRequest webRequestMock = mock(NativeWebRequest.class);
        when(webRequestMock.getNativeRequest(HttpServletRequest.class)).thenReturn(mock(HttpServletRequest.class));
        String userId = (String) new UserIdResolver().resolveArgument(null, null, webRequestMock, null);
        assertEquals("cs0008", userId);

    }

    @Test
    public void exceptionThrownWhenRequestTypeIsNotHttpRequest() {
        assertThrows(NullPointerException.class, () -> {
            NativeWebRequest webRequestMock = mock(NativeWebRequest.class);
            new UserIdResolver().resolveArgument(null, null, webRequestMock, null);
        });
    }

    @Test
    public void parameterNotSupportedWhenNotAnnotatedWithUserIdAnnotation() {
        MethodParameter methodParameterMock = mock(MethodParameter.class);
        assertFalse(new UserIdResolver().supportsParameter(methodParameterMock));
    }

    @Test
    public void parameterSupportedWhenAnnotatedWithUserIdAnnotationAndOfTypeString() {
        MethodParameter methodParameterMock = mock(MethodParameter.class);
        when(methodParameterMock.hasParameterAnnotation(UserId.class)).thenReturn(true);
        //noinspection unchecked
        when(methodParameterMock.getParameterType()).thenReturn((Class) String.class);
        assertTrue(new UserIdResolver().supportsParameter(methodParameterMock));
    }
}
