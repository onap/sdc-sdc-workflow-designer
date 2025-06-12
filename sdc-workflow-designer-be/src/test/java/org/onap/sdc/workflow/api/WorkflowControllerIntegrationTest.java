/*
 * Copyright © 2016-2018 European Support Limited
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
package org.onap.sdc.workflow.api;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.onap.sdc.workflow.services.types.Page;
import org.onap.sdc.workflow.services.types.Workflow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.boot.web.client.RestTemplateCustomizer;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.testcontainers.containers.CassandraContainer;
// import org.testcontainers.cassandra.CassandraContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.SneakyThrows;

@Testcontainers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT,
    properties = {
        "spring.data.cassandra.contact-points=localhost",
        "spring.data.cassandra.schema-action=CREATE_IF_NOT_EXISTS"
})
public class WorkflowControllerIntegrationTest {

    @LocalServerPort
    int port;

    ObjectMapper mapper = new ObjectMapper();

    @Autowired
    RestTemplateBuilder builder;
    RestTemplate restTemplate;

    @BeforeEach
    void setup() {
        this.restTemplate = builder
            .rootUri("http://localhost:" + port)
            .defaultHeader(HttpHeaders.ACCEPT, "application/json")
            .build();
        // this.restTemplate = new RestTemplate();

        // List<HttpMessageConverter<?>> messageConverters = restTemplate.getMessageConverters();
        // String foo = "";
    }



    @Container
    private static CassandraContainer<?> cassandraContainer
        = new CassandraContainer<>("cassandra:3.11.2")
            .withInitScript("db/create_keyspaces.cql")
            // .withInitScript("db/create_tables.cql")
            .withExposedPorts(9042);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.cassandra.port", () -> cassandraContainer.getFirstMappedPort());
    }

    @Test
    @SneakyThrows
    public void someTest() {
        String baseUrl = "/wf/workflows";
        String queryParams = UriComponentsBuilder
                .fromUriString(baseUrl)
                .queryParam("sort", "name:asc")
                .queryParam("limit", 31)
                .queryParam("offset", 0)
                .queryParam("archiving", "ACTIVE")
                .toUriString();

        ResponseEntity<String> response = restTemplate.getForEntity(queryParams, String.class);
        assert(response.getStatusCode().is2xxSuccessful());

    }

}
