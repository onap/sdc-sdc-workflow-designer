package org.onap.sdc.workflow.server.config;

import java.util.List;

import org.openecomp.sdc.logging.servlet.HttpHeader;
import org.openecomp.sdc.logging.servlet.spring.LoggingInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WorkflowBEConfig {
    @Value("#{'${requestIdHeader}'.split(',')}")
    private List<String> requestIdHeader;
    @Value("#{'${partnerNameHeader}'.split(',')}")
    private List<String> partnerNameHeader;

    @Bean
    public LoggingInterceptor loggingInterceptorCreate() {
        return new LoggingInterceptor(new HttpHeader(partnerNameHeader), new HttpHeader(requestIdHeader));
    }

}
