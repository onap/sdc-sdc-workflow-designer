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

package org.onap.sdc.workflow;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.joran.JoranConfigurator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.slf4j.MarkerFactory;

class LogbackConfigTest {

    private final ByteArrayOutputStream stdout = new ByteArrayOutputStream();
    private PrintStream originalStdout;
    private LoggerContext context;

    @BeforeEach
    void configureShippedLogback() throws Exception {
        originalStdout = System.out;
        System.setOut(new PrintStream(stdout, true, StandardCharsets.UTF_8));
        context = new LoggerContext();
        JoranConfigurator configurator = new JoranConfigurator();
        configurator.setContext(context);
        configurator.doConfigure(getClass().getResource("/logback.xml"));
    }

    @AfterEach
    void restoreStdout() {
        context.stop();
        System.setOut(originalStdout);
        MDC.clear();
    }

    @Test
    void applicationLogsReachStdoutAsJson() throws Exception {
        MDC.put("RequestId", "req-1");
        context.getLogger("org.onap.sdc.workflow.services.impl.WorkflowManagerImpl").info("workflow created");

        List<JsonNode> lines = stdoutLines();
        assertEquals(1, lines.size());
        JsonNode line = lines.get(0);
        assertEquals("workflow created", line.get("message").asText());
        assertEquals("INFO", line.get("level").asText());
        assertEquals("org.onap.sdc.workflow.services.impl.WorkflowManagerImpl", line.get("logger_name").asText());
        assertEquals("sdc-wfd-be", line.get("service.name").asText());
        assertEquals("req-1", line.get("RequestId").asText());
    }

    @Test
    void sdcAuditRecordsReachStdoutWithTheirMarker() throws Exception {
        MDC.put("StatusCode", "COMPLETE");
        context.getLogger("org.openecomp.sdc.logging.servlet.spring.LoggingInterceptor").info(MarkerFactory.getMarker("AUDIT"), "");

        JsonNode line = stdoutLines().get(0);
        assertEquals("AUDIT", line.get("tags").get(0).asText());
        assertEquals("COMPLETE", line.get("StatusCode").asText());
    }

    @Test
    void debugIsNotLoggedByDefault() throws Exception {
        context.getLogger("org.onap.sdc.workflow").debug("noise");
        context.getLogger("org.eclipse.jetty.io.ManagedSelector").debug("noise");

        assertTrue(stdoutLines().isEmpty());
    }

    private List<JsonNode> stdoutLines() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        List<JsonNode> lines = new ArrayList<>();
        for (String line : stdout.toString(StandardCharsets.UTF_8).split("\n")) {
            if (!line.isBlank()) {
                lines.add(mapper.readTree(line));
            }
        }
        return lines;
    }
}
