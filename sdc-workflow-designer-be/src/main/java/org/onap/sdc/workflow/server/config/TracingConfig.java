/*
 * Copyright © 2026 Deutsche Telekom
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

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.contrib.sampler.RuleBasedRoutingSampler;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TracingConfig {

    static final AttributeKey<String> URL_PATH = AttributeKey.stringKey("url.path");

    @Bean
    public AutoConfigurationCustomizerProvider skipActuatorTraces() {
        return customizer -> customizer.addSamplerCustomizer((sampler, config) -> skipActuator(sampler));
    }

    static Sampler skipActuator(Sampler sampler) {
        return RuleBasedRoutingSampler.builder(SpanKind.SERVER, sampler)
                .drop(URL_PATH, "^/actuator.*")
                .build();
    }
}
