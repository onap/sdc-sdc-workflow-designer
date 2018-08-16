package org.onap.sdc.workflow.server.config;

import org.openecomp.sdc.logging.servlet.HttpHeader;
import org.openecomp.sdc.logging.servlet.spring.LoggingInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LoggingInterceptorConfig {

    @Value("${onap.logging.requestIdHeader}")
    private String[] loggingRequestIdHeaders;

    @Value("${onap.logging.partnerNameHeader}")
    private String[] loggingPartnerNameHeader;

    @Bean
    public LoggingInterceptor loggingInterceptorCreate() {
        return new LoggingInterceptor(new HttpHeader(loggingRequestIdHeaders),
                new HttpHeader(loggingPartnerNameHeader));
    }
}
