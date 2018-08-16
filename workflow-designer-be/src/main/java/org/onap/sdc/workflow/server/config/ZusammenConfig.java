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
    public void init() {
        System.setProperty("cassandra.nodes", cassandraAddress);
        System.setProperty("cassandra.user", cassandraUser);
        System.setProperty("cassandra.password", cassandraPassword);
        System.setProperty("cassandra.authenticate", Boolean.toString(Boolean.valueOf(cassandraAuth)));
    }

    public String getTenant() {
        return tenant;
    }
}