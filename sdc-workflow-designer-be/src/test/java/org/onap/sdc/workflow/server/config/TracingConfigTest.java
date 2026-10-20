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

import static org.junit.jupiter.api.Assertions.assertEquals;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.context.Context;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import io.opentelemetry.sdk.trace.samplers.SamplingDecision;
import java.util.Collections;
import org.junit.jupiter.api.Test;

class TracingConfigTest {

    private static final String TRACE_ID = "4bf92f3577b34da6a3ce929d0e0e4736";

    private final Sampler sampler = TracingConfig.skipActuator(Sampler.alwaysOn());

    @Test
    void dropsActuatorRequests() {
        assertEquals(SamplingDecision.DROP, decide(SpanKind.SERVER, "/actuator/prometheus"));
    }

    @Test
    void samplesApiRequests() {
        assertEquals(SamplingDecision.RECORD_AND_SAMPLE, decide(SpanKind.SERVER, "/wf/workflows"));
    }

    @Test
    void samplesClientCallsToActuatorPaths() {
        assertEquals(SamplingDecision.RECORD_AND_SAMPLE, decide(SpanKind.CLIENT, "/actuator/health"));
    }

    private SamplingDecision decide(SpanKind kind, String path) {
        return sampler.shouldSample(Context.root(), TRACE_ID, "GET", kind,
                Attributes.of(TracingConfig.URL_PATH, path), Collections.emptyList()).getDecision();
    }
}
