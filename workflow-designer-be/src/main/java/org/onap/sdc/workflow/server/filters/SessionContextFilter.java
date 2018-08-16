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

package org.onap.sdc.workflow.server.filters;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import org.onap.sdc.workflow.server.config.ZusammenConfig;
import org.openecomp.sdc.common.session.SessionContextProvider;
import org.openecomp.sdc.common.session.SessionContextProviderFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SessionContextFilter implements Filter {

    private ZusammenConfig zusammenConfig;

    @Autowired
    public SessionContextFilter(ZusammenConfig zusammenConfig) {
        this.zusammenConfig = zusammenConfig;
    }

    @Override
    public void init(FilterConfig filterConfig) {
        // not implemented
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        SessionContextProvider contextProvider = SessionContextProviderFactory.getInstance().createInterface();

        try {
            if (servletRequest instanceof HttpServletRequest) {
                contextProvider.create(getUser(servletRequest), getTenant());
            }

            filterChain.doFilter(servletRequest, servletResponse);
        } finally {
            contextProvider.close();
        }
    }

    @Override
    public void destroy() {
        // not implemented
    }

    private String getUser(ServletRequest servletRequest) {
        return "GLOBAL_USER";
        // TODO: 7/11/2018 get user from header when collaboration will be supported
                //((HttpServletRequest) servletRequest).getHeader(USER_ID_HEADER_PARAM);
    }

    private String getTenant() {
        return zusammenConfig.getTenant();
    }
}
