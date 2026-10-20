package org.onap.sdc.workflow;
/*
 * Copyright © 2025-2026 Deutsche Telekom
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

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.matching;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.verify;
import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.opentelemetry.instrumentation.spring.autoconfigure.OpenTelemetryAutoConfiguration;
import io.opentelemetry.instrumentation.spring.autoconfigure.internal.instrumentation.web.SpringWebInstrumentationAutoConfiguration;
import io.opentelemetry.instrumentation.spring.autoconfigure.internal.instrumentation.webmvc.SpringWebMvc5InstrumentationAutoConfiguration;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.onap.sdc.workflow.api.ArtifactAssociationService;
import org.onap.sdc.workflow.api.WorkflowController;
import org.onap.sdc.workflow.api.WorkflowVersionController;
import org.onap.sdc.workflow.api.mappers.WorkflowVersionDtoMapper;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.server.config.ApplicationConfigurer;
import org.onap.sdc.workflow.server.config.LoggingInterceptorConfig;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.http.HttpMessageConvertersAutoConfiguration;
import org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration;
import org.springframework.boot.autoconfigure.web.client.RestTemplateAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration;
import org.springframework.boot.logging.LoggingSystem;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import lombok.SneakyThrows;

@AutoConfigureMockMvc
@AutoConfigureWireMock(port = 0)
@ImportAutoConfiguration(classes = {
  OpenTelemetryAutoConfiguration.class,
  SpringWebMvc5InstrumentationAutoConfiguration.class,
  SpringWebInstrumentationAutoConfiguration.class,
  RestTemplateAutoConfiguration.class,
  JacksonAutoConfiguration.class,
  HttpMessageConvertersAutoConfiguration.class,
  WebMvcAutoConfiguration.class
})
@SpringBootTest(properties = {
  "logging.config=classpath:logback.xml",
  "otel.sdk.disabled=false",
  "otel.exporter.otlp.endpoint=http://localhost:${wiremock.server.port}",
  "otel.bsp.schedule.delay=100",
  "sdc.be.endpoint=localhost:${wiremock.server.port}",
  "sdc.be.external.user=workflow",
  "sdc.be.external.password=secret"
}, classes = {
  WorkflowController.class,
  WorkflowVersionController.class,
  ArtifactAssociationService.class,
  ApplicationConfigurer.class,
  LoggingInterceptorConfig.class
})
@ExtendWith(OutputCaptureExtension.class)
public class TracingTest {

  private static final String TRACE_ID = "4bf92f3577b34da6a3ce929d0e0e4736";
  private static final String SDC_ARTIFACT_PATH = "/sdc/v1/catalog/resources/r1/interfaces/i1/artifacts/a1";

  @MockBean
  @Qualifier("workflowManager")
  WorkflowManager workflowManager;

  @MockBean
  @Qualifier("workflowVersionManager")
  WorkflowVersionManager workflowVersionManager;

  @MockBean
  WorkflowVersionDtoMapper workflowVersionDtoMapper;

  @Autowired
  private MockMvc mockMvc;

  // Spring Boot configures logback once per JVM, so a context cached by an earlier test class would
  // make this one skip logging.config and the assertions below would read the test pattern instead.
  @BeforeAll
  @AfterAll
  static void letSpringReconfigureLogging() {
    LoggingSystem.get(TracingTest.class.getClassLoader()).cleanUp();
  }

  @BeforeEach
  void stubCollector() {
    stubFor(post(urlEqualTo("/v1/traces")).willReturn(aResponse().withStatus(HttpStatus.OK.value())));
  }

  @Test
  @SneakyThrows
  public void thatSpansAreExportedOverOtlp() {
    mockMvc.perform(get("/wf/workflows")
      .accept(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk());

    await().atMost(Duration.ofSeconds(10))
        .untilAsserted(() -> verify(postRequestedFor(urlEqualTo("/v1/traces"))));
  }

  @Test
  @SneakyThrows
  public void thatRequestsAreAuditedWithTheOnapRequestIdAndPartner(CapturedOutput output) {
    mockMvc.perform(get("/wf/workflows")
      .header("X-ONAP-RequestID", "req-42")
      .header("USER_ID", "cs0008")
      .accept(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk());

    assertTrue(output.getOut().lines()
        .anyMatch(line -> line.contains("\"tags\":[\"AUDIT\"]")
            && line.contains("\"RequestId\":\"req-42\"")
            && line.contains("\"PartnerName\":\"cs0008\"")));
  }

  @Test
  @SneakyThrows
  public void thatArtifactDeliveryToSdcContinuesTheIncomingTrace(CapturedOutput output) {
    stubFor(post(urlEqualTo(SDC_ARTIFACT_PATH)).willReturn(aResponse().withStatus(HttpStatus.OK.value())));
    when(workflowVersionManager.getArtifact("w1", "v1")).thenReturn(
        new ArtifactEntity("workflow.bpmn", new ByteArrayInputStream("<bpmn/>".getBytes(StandardCharsets.UTF_8))));

    mockMvc.perform(MockMvcRequestBuilders.post("/wf/workflows/w1/versions/v1/artifact-deliveries")
      .header("USER_ID", "cs0008")
      .header("traceparent", "00-" + TRACE_ID + "-00f067aa0ba902b7-01")
      .contentType(MediaType.APPLICATION_JSON)
      .content("{\"method\":\"POST\",\"endpoint\":\"" + SDC_ARTIFACT_PATH.substring(1) + "\"}"))
      .andExpect(status().isOk());

    verify(postRequestedFor(urlEqualTo(SDC_ARTIFACT_PATH))
        .withHeader("traceparent", matching("00-" + TRACE_ID + "-[0-9a-f]{16}-01")));
    assertTrue(output.getOut().lines()
        .anyMatch(line -> line.contains("Delivering artifact workflow.bpmn to SDC")
            && line.contains("\"trace_id\":\"" + TRACE_ID + "\"")));
  }

}
