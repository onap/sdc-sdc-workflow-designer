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

// import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.verify;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.onap.sdc.workflow.api.WorkflowController;
import org.onap.sdc.workflow.services.WorkflowManager;
import org.onap.sdc.workflow.services.WorkflowVersionManager;
import org.onap.sdc.workflow.services.types.Page;
import org.onap.sdc.workflow.services.types.PagingRequest;
import org.onap.sdc.workflow.services.types.Workflow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.web.client.RestTemplate;

import com.github.tomakehurst.wiremock.client.WireMock;

import lombok.SneakyThrows;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@AutoConfigureWireMock(port = 0)
@SpringBootTest(properties = {
  "spring.sleuth.enabled=true",
  "spring.zipkin.baseUrl=http://localhost:${wiremock.server.port}",
  "spring.sleuth.sampler.probability=1.0"
}, classes = {WorkflowController.class})
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

  // @Autowired RestTemplate restTemplate;

  @Test
  @SneakyThrows
  public void thatArtifactsCanBePushed() {
    WireMock.stubFor(
      WireMock.post(WireMock.urlEqualTo("/api/v2/spans"))
          .willReturn(
              WireMock.aResponse()
                  .withStatus(HttpStatus.OK.value())));

    Workflow workflow = new Workflow();
    Page<Workflow> workflowPage = new Page<Workflow>(Arrays.asList(workflow), new PagingRequest(0, 1), 1);
    when(workflowManager.list(anyString(), anyString(), any(), any())).thenReturn(workflowPage);

    MvcResult result = mockMvc.perform(get("/wf/workflows")
      .accept(MediaType.APPLICATION_JSON))
      .andExpect(MockMvcResultMatchers.status().isOk())
      .andReturn();

    String response = result.getResponse().getContentAsString();
    // String response = restTemplate.getForObject("http://localhost:" + wiremockPort + "/wf/workflows", String.class);
    // assertNotNull(response);


    Thread.sleep(2);
    verify(postRequestedFor(urlEqualTo("/api/v2/spans")));
  }

}
