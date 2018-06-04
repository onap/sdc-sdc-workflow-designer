package org.onap.sdc.workflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.embedded.jetty.JettyServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;


@SpringBootApplication
public class SpringBootWebApplication {
  public static void main(String[] args) {
    SpringApplication.run(SpringBootWebApplication.class, args);
  }

  @Bean
  public ConfigurableServletWebServerFactory webServerFactory() {
    JettyServletWebServerFactory factory = new JettyServletWebServerFactory();
    return factory;
  }
}
