package org.onap.sdc.workflow.server.config;

import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ZusammenConfig {

    @Value("${zusammen-tenant:workflow}")
    private String tenant;
    @Value("${spring.data.cassandra.contact-points:localhost}")
    private String cassandraAddress;
    @Value("${spring.data.cassandra.username:}")
    private String cassandraUser;
    @Value("${spring.data.cassandra.password:}")
    private String cassandraPassword;
    @Value("${zusammen.cassandra.isAuthenticate:false}")
    private String cassandraAuth;

    @PostConstruct
    public void init(){
        System.setProperty("cassandra.nodes", cassandraAddress);
        System.setProperty("cassandra.user", cassandraUser);
        System.setProperty("cassandra.password", cassandraPassword);
        System.setProperty("cassandra.authenticate", Boolean.toString(Boolean.valueOf(cassandraAuth)));
    }

    public String getTenant() {
        return tenant;
    }
}