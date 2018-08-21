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

import static org.onap.sdc.workflow.api.RestParams.USER_ID_HEADER;

import java.util.Objects;
import javax.servlet.http.HttpServletRequest;
import org.onap.sdc.workflow.services.annotations.UserId;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * Resolves a user ID from an HTTP header and injects it into a parameter of type {@link String} annotated with {@link
 * UserId}. The header is considered mandatory, therefore an error is returned to the client if no user ID was sent.
 *
 * @author evitaliy
 * @since 21 Aug 2018
 */
public class UserIdResolver implements HandlerMethodArgumentResolver {

    private static final String ERROR_MESSAGE = "Missing mandatory request header '" + USER_ID_HEADER + "'";

    @Override
    public boolean supportsParameter(MethodParameter methodParameter) {

        if (!methodParameter.hasParameterAnnotation(UserId.class)) {
            return false;
        }

        Class<?> parameterType = methodParameter.getParameterType();
        if (!parameterType.equals(String.class)) {
            throw new IllegalStateException("Cannot inject user ID into a parameter of type "
                                                    + parameterType.getTypeName());
        }

        return true;
    }

    @Override
    public Object resolveArgument(MethodParameter methodParameter, ModelAndViewContainer modelAndViewContainer,
            NativeWebRequest nativeWebRequest, WebDataBinderFactory webDataBinderFactory)
            throws ServletRequestBindingException {

        HttpServletRequest httpServletRequest = nativeWebRequest.getNativeRequest(HttpServletRequest.class);
        String userHeader = Objects.requireNonNull(httpServletRequest).getHeader(USER_ID_HEADER);
        if (userHeader == null) {
            throw new ServletRequestBindingException(ERROR_MESSAGE);
        }

        return userHeader;
    }
}