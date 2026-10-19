/*
 * Copyright © 2026 Deutsche Telekom AG
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

import com.datastax.oss.driver.api.core.config.DefaultDriverOption;
import com.datastax.oss.driver.internal.core.auth.PlainTextAuthProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.cassandra.DriverConfigLoaderBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

/**
 * Not spring.data.cassandra.username: Spring Boot rejects an empty value at startup, and CS_USER
 * is empty whenever Cassandra authentication is disabled.
 */
@Configuration
public class CassandraAuthConfig {

    @Bean
    public DriverConfigLoaderBuilderCustomizer cassandraAuthCustomizer(
            @Value("${workflow.cassandra.username:}") String username,
            @Value("${workflow.cassandra.password:}") String password) {
        return builder -> {
            if (StringUtils.hasText(username)) {
                builder.withString(DefaultDriverOption.AUTH_PROVIDER_CLASS, PlainTextAuthProvider.class.getName())
                       .withString(DefaultDriverOption.AUTH_PROVIDER_USER_NAME, username)
                       .withString(DefaultDriverOption.AUTH_PROVIDER_PASSWORD, password);
            }
        };
    }
}
