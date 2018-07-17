package org.onap.workflow.web;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import org.eclipse.jetty.proxy.ProxyServlet;

/**
 * @author evitaliy
 * @since 16 Jul 2018
 */
public class TransparentProxy extends ProxyServlet.Transparent {

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(new ServletConfigWrapper(config));
    }

    private class ServletConfigWrapper implements ServletConfig {

        private static final String PROXY_TO = "proxyTo";
        private final String redirectPath;
        private final ServletConfig config;

        ServletConfigWrapper(ServletConfig config) throws ServletException {

            this.redirectPath = System.getProperty("backend");
            if (this.redirectPath == null) {
                throw new ServletException("Specify backend address using '-Dbackend' JVM parameter");
            }

            this.config = config;
        }

        @Override
        public String getServletName() {
            return config.getServletName();
        }

        @Override
        public ServletContext getServletContext() {
            return config.getServletContext();
        }

        @Override
        public String getInitParameter(String s) {
            return PROXY_TO.equals(s) ? this.redirectPath : config.getInitParameter(s);
        }

        @Override
        public Enumeration<String> getInitParameterNames() {
            ArrayList<String> params = Collections.list(config.getInitParameterNames());
            params.add(PROXY_TO);
            return Collections.enumeration(params);
        }
    }
}
