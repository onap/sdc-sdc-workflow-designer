package org.onap.sdc.workflow;
/*
 * Copyright © 2025 Deutsche Telekom
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

import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.junit.jupiter.api.Test;
import org.onap.sdc.workflow.api.WorkflowController;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.cloud.sleuth.autoconfig.TraceAutoConfiguration;
import org.springframework.cloud.sleuth.zipkin2.ZipkinAutoConfiguration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.github.tomakehurst.wiremock.client.WireMock;

import lombok.SneakyThrows;

@AutoConfigureMockMvc
@AutoConfigureWireMock(port = 0)
@ImportAutoConfiguration(classes = {TraceAutoConfiguration.class, ZipkinAutoConfiguration.class})
@SpringBootTest(properties = {
  "spring.sleuth.enabled=true",
  "spring.zipkin.baseUrl=http://localhost:${wiremock.server.port}",
  "spring.sleuth.sampler.probability=1.0"
}, classes = WorkflowController.class)
public class TracingTest {

  @MockBean
  @Qualifier("workflowManager")
  WorkflowManager workflowManager;

  @MockBean
  @Qualifier("workflowVersionManager")
  WorkflowVersionManager workflowVersionManager;

  @Autowired
  private MockMvc mockMvc;

  @Value("${wiremock.server.port}")
  private int wiremockPort;

  @Test
  @SneakyThrows
  public void thatArtifactsCanBePushed() {
    WireMock.stubFor(
      WireMock.post(WireMock.urlEqualTo("/api/v2/spans"))
          .willReturn(
              WireMock.aResponse()
                  .withStatus(HttpStatus.OK.value())));

    mockMvc.perform(get("/wf/workflows")
      .accept(MediaType.APPLICATION_JSON))
      .andExpect(MockMvcResultMatchers.status().isOk());

    verify(postRequestedFor(urlEqualTo("/api/v2/spans")));
  }

}
