/*
 * Copyright © 2018 European Support Limited
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

import static junit.framework.TestCase.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.io.InputStream;
import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.onap.sdc.workflow.api.types.dto.ArtifactDeliveriesRequestDto;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.web.client.RestTemplate;


@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(
        classes = {ArtifactAssociationHandlerTest.RestBuilderMockProvider.class, ArtifactAssociationService.class})
@TestPropertySource(locations = "classpath:application-test.properties")
@Component("ArtifactAssociationHandlerTest")
public class ArtifactAssociationHandlerTest {

    @Configuration
    static class RestBuilderMockProvider {

        @Bean
        public RestTemplateBuilder templateBuilder() {
            return Mockito.mock(RestTemplateBuilder.class);
        }

        @Bean
        public RestTemplate restTemplate() {
            return Mockito.mock(RestTemplate.class);
        }
    }

    private static final String FILE_NAME = "fileName.txt";
    private static final String USER_ID = "cs0008";
    private static final String END_POINT =
            "sdc/v1/catalog/resources/46434d20-40f6-4a5f-a0c4-8c1da6791bdb/interfaces/137a0264-47a5-4dab-b79d-cfdd8cd9a9a1/artifacts/ef82dec9-cb99-48a3-aaba-5ae832417dc5";
    private final String EROR_MSG =
            "Failed while attaching workflow artifact to Operation in SDC. Parameters were not initialized: [SDC_ENDPOINT]";
    private InputStream inputStreamMock;
    private ArtifactEntity artifactMock;
    private ArtifactDeliveriesRequestDto requestDto;
    @Value("${sdc.be.endpoint}")
    private String sdcBeEndpoint;
    @Value("${sdc.be.protocol}")
    private String sdcBeProtocol;
    @Value("${sdc.be.external.user}")
    private String sdcUser;
    @Value("${sdc.be.external.password}")
    private String sdcPassword;

    @Autowired
    private RestTemplate restClientMock;


    @Autowired
    private ArtifactAssociationService associationService;

    @Before
    public void setUp() throws IOException {
        inputStreamMock = IOUtils.toInputStream("some test data for my input stream", "UTF-8");
        artifactMock = new ArtifactEntity(FILE_NAME, inputStreamMock);
        requestDto = new ArtifactDeliveriesRequestDto("POST", END_POINT);
        associationService.setRestClient(restClientMock);
    }


    @Test
    public void shouldGetResponseStatusOk() {
        ResponseEntity<String> responseEntity = new ResponseEntity(HttpStatus.OK);
        when(restClientMock.exchange(eq(sdcBeProtocol + "://" + sdcBeEndpoint + "/" + requestDto.getEndpoint()),
                eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class))).thenReturn(responseEntity);

        ResponseEntity<String> response = associationService.execute(USER_ID, requestDto, artifactMock);
        assertEquals(200, response.getStatusCode().value());

    }


    @Test
    public void shouldReturnStatusFailWhenNoParametersInitialized() {
        associationService.setSdcBeEndpoint(null);
        ResponseEntity<String> response = associationService.execute(USER_ID, requestDto, artifactMock);
        assertEquals(417, response.getStatusCode().value());
        assertEquals(EROR_MSG, response.getBody());
    }

}
