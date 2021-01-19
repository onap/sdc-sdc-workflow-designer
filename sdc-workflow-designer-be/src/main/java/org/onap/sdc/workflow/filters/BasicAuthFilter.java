/*-
 * ============LICENSE_START=======================================================
 * SDC-workflow-designer
 * ================================================================================
 * Copyright (C) 2021 AT&T Intellectual Property. All rights reserved.
 * ================================================================================
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
 * ============LICENSE_END=========================================================
 */

package org.onap.sdc.workflow.filters;

import java.util.Arrays;
import java.util.List;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE)
public class BasicAuthFilter implements Filter {

    @Value("${basic.auth.credential}")
    private String basicAuthCredential;
    @Value("${basic.auth.excludedUrls}")
    private String basicAuthExcludedUrls;

    @Override
    public void destroy() {
    }

    @Override
    public void doFilter(ServletRequest arg0, ServletResponse arg1, FilterChain arg2)
        throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) arg0;
        HttpServletRequestWrapper servletRequest = new HttpServletRequestWrapper(httpRequest);

        // BasicAuth is disabled
        if (basicAuthCredential == null) {
            arg2.doFilter(servletRequest, arg1);
            return;
        }

        if (basicAuthExcludedUrls != null) {
            List<String> excludedUrls = Arrays.asList(basicAuthExcludedUrls.split(","));
            if (excludedUrls.contains(httpRequest.getServletPath() + httpRequest.getPathInfo())) {
                // this url is included in the excludeUrls list, no need for authentication
                arg2.doFilter(servletRequest, arg1);
                return;
            }
        }

        // Get the basicAuth info from the header
        String authorizationHeader = httpRequest.getHeader("Authorization");
        if (authorizationHeader == null || authorizationHeader.isEmpty()) {
            ((HttpServletResponse) arg1).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        if (httpRequest.getHeader("Authorization").equals("Basic " + basicAuthCredential)) {
            arg2.doFilter(servletRequest, arg1);
        } else {
            ((HttpServletResponse) arg1).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }

    @Override
    public void init(FilterConfig config) throws ServletException {
    }

}
