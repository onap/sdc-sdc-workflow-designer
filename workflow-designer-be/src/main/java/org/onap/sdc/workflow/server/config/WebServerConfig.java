package org.onap.sdc.workflow.server.config;

import org.eclipse.jetty.server.ServerConnector;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.embedded.jetty.JettyServerCustomizer;
import org.springframework.boot.web.embedded.jetty.JettyServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebServerConfig implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

    @Value("${http.port}")
    private int httpPort;

    @Override
    public void customize(ConfigurableServletWebServerFactory container) {
        if (container instanceof JettyServletWebServerFactory) {
            JettyServletWebServerFactory containerFactory = (JettyServletWebServerFactory) container;
            containerFactory.addServerCustomizers((JettyServerCustomizer) server -> {
                ServerConnector connector = new ServerConnector(server);
                connector.setPort(httpPort);
                server.addConnector(connector);
            });
        }
    }
}
