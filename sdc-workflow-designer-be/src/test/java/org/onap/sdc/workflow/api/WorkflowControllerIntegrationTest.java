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

package org.onap.sdc.workflow.api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.testcontainers.containers.CassandraContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

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
    }



    @Container
    private static CassandraContainer<?> cassandraContainer
        = new CassandraContainer<>("cassandra:3.11.2")
            .withInitScript("db/init.cql")
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
