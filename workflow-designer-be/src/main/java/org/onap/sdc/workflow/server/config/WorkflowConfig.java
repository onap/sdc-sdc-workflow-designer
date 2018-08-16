package org.onap.sdc.workflow.server.config;

import org.openecomp.sdc.logging.servlet.HttpHeader;
import org.openecomp.sdc.logging.servlet.spring.LoggingInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WorkflowConfig {
    @Value("${onap.logging.requestIdHeader}")
    private String[] logging_requestHeaders;

    @Value("${onap.logging.partnerNameHeader}")
    private String[] logging_partnerNameHeader;

    @Bean
    public LoggingInterceptor loggingInterceptorCreate() {
        return new LoggingInterceptor(new HttpHeader(logging_requestHeaders),
                new HttpHeader(logging_partnerNameHeader));
    }

}
