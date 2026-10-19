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

import static org.mockito.Mockito.RETURNS_SELF;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.datastax.oss.driver.api.core.config.DefaultDriverOption;
import com.datastax.oss.driver.api.core.config.ProgrammaticDriverConfigLoaderBuilder;
import com.datastax.oss.driver.internal.core.auth.PlainTextAuthProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class CassandraAuthConfigTest {

    private final ProgrammaticDriverConfigLoaderBuilder builder =
            mock(ProgrammaticDriverConfigLoaderBuilder.class, RETURNS_SELF);

    @ParameterizedTest
    @ValueSource(strings = {"", " "})
    void doesNotConfigureAuthenticationWithoutUsername(String username) {
        new CassandraAuthConfig().cassandraAuthCustomizer(username, "").customize(builder);

        verifyNoInteractions(builder);
    }

    @Test
    void configuresPlainTextAuthenticationWhenUsernameIsSet() {
        new CassandraAuthConfig().cassandraAuthCustomizer("sdc", "secret").customize(builder);

        verify(builder).withString(DefaultDriverOption.AUTH_PROVIDER_CLASS, PlainTextAuthProvider.class.getName());
        verify(builder).withString(DefaultDriverOption.AUTH_PROVIDER_USER_NAME, "sdc");
        verify(builder).withString(DefaultDriverOption.AUTH_PROVIDER_PASSWORD, "secret");
    }
}
