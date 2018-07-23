package org.onap.workflow.web;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import org.eclipse.jetty.proxy.ProxyServlet;

/**
 * <p>A naive implementation of transparent proxy based on
 * <a href="https://www.eclipse.org/jetty/documentation/9.4.x/proxy-servlet.html">Jetty proxy servlet</a>.
 * The only difference is that the <code>proxyTo</code> configuration parameter is taken from a JVM argument (and can
 * be therefore injected via an environment variable), instead of an <code>init-param</code> in <i>web.xml</i>.</p>
 * <p>Example: <code>java -DproxyTo=http://172.17.0.9:8080 -jar $JETTY_HOME/start.jar</code></p>
 * <p>If you get a <i>502 Bad Gateway</i> error:</p>
 * <ul>
 *     <ol>
 *         Make sure that Jetty 'proxy' module
 *         <a href="https://www.eclipse.org/jetty/documentation/9.4.x/startup-modules.html">is not enabled</a>.
 *     </ol>
 *     <ol>
 *         Check the value of <code>proxyTo</code>. Make sure it does not redirect to the proxy server itself.
 *     </ol>
 *     <ol>
 *         Make sure there is no proxy (e.g. in a corporate environment) between the servlet and <code>proxyTo</code>.
 *     </ol>
 * </ul>
 *
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

        private final String proxyTo;
        private final ServletConfig config;

        ServletConfigWrapper(ServletConfig config) throws ServletException {

            this.proxyTo = System.getProperty(PROXY_TO);
            if (this.proxyTo == null) {
                throw new ServletException("-D" + PROXY_TO + " must be specified");
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
            return PROXY_TO.equals(s) ? this.proxyTo : config.getInitParameter(s);
        }

        @Override
        public Enumeration<String> getInitParameterNames() {
            ArrayList<String> params = Collections.list(config.getInitParameterNames());
            params.add(PROXY_TO);
            return Collections.enumeration(params);
        }
    }
}
