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

package org.onap.sdc.workflow.server.config;

import com.datastax.driver.core.RemoteEndpointAwareJdkSSLOptions;
import com.datastax.driver.core.SSLOptions;
import java.io.FileInputStream;
import java.security.KeyStore;
import java.security.SecureRandom;
import javax.annotation.PostConstruct;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import org.springframework.beans.factory.BeanCreationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.cassandra.ClusterBuilderCustomizer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ZusammenConfig {

    @Value("${spring.data.cassandra.keyspace-name}")
    private String tenant;
    @Value("${spring.data.cassandra.contact-points}")
    private String cassandraAddress;
    @Value("${spring.data.cassandra.username}")
    private String cassandraUser;
    @Value("${spring.data.cassandra.password}")
    private String cassandraPassword;
    @Value("${zusammen.cassandra.isAuthenticate}")
    private String cassandraAuth;
    @Value("${spring.data.cassandra.ssl}")
    private String cassandraSSL;
    @Value("${zusammen.cassandra.trustStorePath}")
    private String cassandraTrustStorePath;
    @Value("${zusammen.cassandra.trustStorePassword}")
    private String cassandraTrustStorePassword;

    private static final String[] CIPHER_SUITES = {"TLS_RSA_WITH_AES_128_CBC_SHA"};
    private static final String KEYSTORE_TYPE = "JKS";
    private static final String SECURE_SOCKET_PROTOCOL = "SSL";

    @PostConstruct
    public void init() {
        System.setProperty("cassandra.nodes", cassandraAddress);
        System.setProperty("cassandra.user", cassandraUser);
        System.setProperty("cassandra.password", cassandraPassword);
        System.setProperty("cassandra.authenticate", Boolean.toString(Boolean.valueOf(cassandraAuth)));
        System.setProperty("cassandra.ssl", Boolean.toString(Boolean.valueOf(cassandraSSL)));
        System.setProperty("cassandra.truststore", cassandraTrustStorePath);
        System.setProperty("cassandra.truststore.password", cassandraTrustStorePassword);
    }

    public String getTenant() {
        return tenant;
    }

    @Bean
    @ConditionalOnProperty("spring.data.cassandra.ssl")
    ClusterBuilderCustomizer clusterBuilderCustomizer() {
        SSLOptions sslOptions = RemoteEndpointAwareJdkSSLOptions
                                        .builder()
                                        .withSSLContext(getSslContext())
                                        .withCipherSuites(CIPHER_SUITES).build();
        return builder -> builder.withSSL(sslOptions);
    }

    private SSLContext getSslContext() {
        try (FileInputStream tsf = new FileInputStream(cassandraTrustStorePath)) {
            SSLContext ctx = SSLContext.getInstance(SECURE_SOCKET_PROTOCOL);
            KeyStore ts = KeyStore.getInstance(KEYSTORE_TYPE);
            ts.load(tsf, cassandraTrustStorePassword.toCharArray());
            TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            tmf.init(ts);
            ctx.init(null, tmf.getTrustManagers(), new SecureRandom());
            return ctx;
        } catch (Exception ex) {
            throw new BeanCreationException(ex.getMessage(), ex);
        }
    }
}