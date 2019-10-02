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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.onap.sdc.workflow.api.RestParams.USER_ID_HEADER;

import javax.servlet.http.HttpServletRequest;
import org.junit.Test;
import org.onap.sdc.workflow.services.annotations.UserId;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.context.request.NativeWebRequest;

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

    @Test(expected = IllegalStateException.class)
    public void illegalTypeErrorThrownWhenAnnotatedParameterIsNotOfTypeString() {
        MethodParameter methodParameterMock = mock(MethodParameter.class);
        when(methodParameterMock.hasParameterAnnotation(UserId.class)).thenReturn(true);
        //noinspection unchecked
        when(methodParameterMock.getParameterType()).thenReturn((Class)String[].class);
        new UserIdResolver().supportsParameter(methodParameterMock);
    }

    @Test(expected = ServletRequestBindingException.class)
    public void missingHeaderErrorThrownWhenUserIdHeaderNotPopulated() throws ServletRequestBindingException {
        NativeWebRequest webRequestMock = mock(NativeWebRequest.class);
        when(webRequestMock.getNativeRequest(HttpServletRequest.class)).thenReturn(mock(HttpServletRequest.class));
        new UserIdResolver().resolveArgument(null, null, webRequestMock, null);
    }

    @Test(expected = NullPointerException.class)
    public void exceptionThrownWhenRequestTypeIsNotHttpRequest() throws ServletRequestBindingException {
        NativeWebRequest webRequestMock = mock(NativeWebRequest.class);
        new UserIdResolver().resolveArgument(null, null, webRequestMock, null);
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