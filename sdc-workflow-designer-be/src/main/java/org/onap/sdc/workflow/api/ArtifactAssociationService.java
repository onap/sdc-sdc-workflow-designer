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

import static org.apache.commons.codec.digest.DigestUtils.md5Hex;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.apache.http.conn.ssl.TrustStrategy;
import org.openecomp.sdc.logging.api.Logger;
import org.openecomp.sdc.logging.api.LoggerFactory;

import java.util.Base64;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpHost;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustSelfSignedStrategy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContexts;
import org.onap.sdc.workflow.api.types.dto.ArtifactDeliveriesRequestDto;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.SSLContext;


@Component("ArtifactAssociationHandler")
public class ArtifactAssociationService {

    private static final String WORKFLOW_ARTIFACT_TYPE = "WORKFLOW";
    private static final String WORKFLOW_ARTIFACT_DESCRIPTION = "Workflow Artifact Description";
    private static final String USER_ID_HEADER = "USER_ID";
    private static final String MD5_HEADER = "Content-MD5";
    private static final String X_ECOMP_INSTANCE_ID_HEADER = "X-ECOMP-InstanceID";
    private static final String INIT_ERROR_MSG =
            "Failed while attaching workflow artifact to Operation in SDC. Parameters were not initialized: %s";
    private static final String INIT_CLIENT_MSG =
            "Failed while creating the HTTP client to SDC. Following exception: %s";
    private static final Logger LOGGER = LoggerFactory.getLogger(ArtifactAssociationService.class);
    @Value("${sdc.be.endpoint}")
    private String sdcBeEndpoint;
    @Value("${sdc.be.protocol}")
    private String sdcBeProtocol;
    @Value("${sdc.be.external.user}")
    private String sdcUser;
    @Value("${sdc.be.external.password}")
    private String sdcPassword;

    private RestTemplate restClient;

    private KeyStore getKeyStore(String file, String password, String keyStoreType) throws IOException, GeneralSecurityException {
        KeyStore keyStore = KeyStore.getInstance(keyStoreType);
        File keyFile = new File(file);
        try (FileInputStream inStr = new FileInputStream(keyFile)) {
            keyStore.load(inStr, password.toCharArray());
        }
        return keyStore;

    }


    public ArtifactAssociationService(RestTemplateBuilder builder,
                                      @Value("${server.ssl.trust-store}")
                                              String truststorePath,
                                      @Value("${server.ssl.trust-store-password}")
                                              String truststorePassword,
                                      @Value("${server.ssl.trust-store-type}")
                                              String truststoreType,
                                      @Value("${server.ssl.key-store}")
                                              String keystorePath,
                                      @Value("${server.ssl.key-password}")
                                              String keystorePassword,
                                      @Value("${server.ssl.key-store-type}")
                                              String keystoreType,
                                      @Value("${sdc.be.protocol}")
                                              String protocol) {
        if (protocol != null &&
                !protocol.equalsIgnoreCase(HttpHost.DEFAULT_SCHEME_NAME)) {
            try {
                KeyStore trustStore = getKeyStore(truststorePath, truststorePassword, truststoreType);
                KeyStore keyStore = getKeyStore(keystorePath, keystorePassword, keystoreType);

                SSLContext sslcontext = SSLContexts.custom()
                        .loadKeyMaterial(keyStore, keystorePassword.toCharArray())
                        .loadTrustMaterial(trustStore, new TrustSelfSignedStrategy())
                        .build();
                SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(
                        sslcontext,
                        new NoopHostnameVerifier()
                );
                CloseableHttpClient httpClient =
                        HttpClients.custom()
                                .setSSLSocketFactory(sslsf)
                                .setSSLHostnameVerifier(new NoopHostnameVerifier())
                                .build();
                HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
                this.restClient = new RestTemplate(factory);
            } catch (Exception e) {
                LOGGER.error(String.format(INIT_CLIENT_MSG, e.getMessage()), e);
            }
        } else {
            this.restClient = builder.build();
        }
    }

    void setRestClient(RestTemplate restClient) {
        this.restClient = restClient;
    }

    void setSdcBeEndpoint(String value) {
        this.sdcBeEndpoint = value;
    }

    ResponseEntity<String> execute(String userId, ArtifactDeliveriesRequestDto deliveriesRequestDto,
                                   ArtifactEntity artifactEntity) {

        Optional<String> initializationState = parametersInitializationState();
        if (initializationState.isPresent()) {
            LOGGER.error(String.format(INIT_ERROR_MSG, initializationState.get()));
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(String.format(INIT_ERROR_MSG, initializationState.get()));
        }

        String formattedArtifact;
        try {
            formattedArtifact = getFormattedWorkflowArtifact(artifactEntity);
        } catch (IOException e) {
            LOGGER.error("Failed while attaching workflow artifact to Operation in SDC", e);
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(e.getMessage());
        }

        HttpEntity<String> request = new HttpEntity<>(formattedArtifact, createHeaders(userId, formattedArtifact));

        return restClient.exchange(sdcBeProtocol + "://" + sdcBeEndpoint + "/" + deliveriesRequestDto.getEndpoint(),
                HttpMethod.valueOf(deliveriesRequestDto.getMethod()), request, String.class);
    }

    Optional<String> parametersInitializationState() {
        ArrayList<String> result = new ArrayList<>();
        if (sdcBeEndpoint == null || sdcBeEndpoint.equals("")) {
            result.add("SDC_ENDPOINT");
        }
        if (sdcBeProtocol == null || sdcBeProtocol.equals("")) {
            result.add("SDC_PROTOCOL");
        }
        if (sdcUser == null || sdcUser.equals("")) {
            result.add("SDC_USER");
        }
        if (sdcPassword == null || sdcPassword.equals("")) {
            result.add("SDC_PASSWORD");
        }

        if (result.isEmpty() || this.restClient == null) {
            return Optional.empty();
        } else {
            return Optional.of(result.toString());
        }
    }


    private String getFormattedWorkflowArtifact(ArtifactEntity artifactEntity) throws IOException {

        byte[] encodeBase64 = Base64.getEncoder().encode(IOUtils.toByteArray(artifactEntity.getArtifactData()));
        String encodedPayloadData = new String(encodeBase64);

        Map<String, String> artifactInfo = new HashMap<>();
        artifactInfo.put("artifactName", artifactEntity.getFileName());
        artifactInfo.put("payloadData", encodedPayloadData);
        artifactInfo.put("artifactType", WORKFLOW_ARTIFACT_TYPE);
        artifactInfo.put("description", WORKFLOW_ARTIFACT_DESCRIPTION);

        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(artifactInfo);
    }

    private HttpHeaders createHeaders(String userId, String formattedArtifact) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(USER_ID_HEADER, userId);
        headers.add(HttpHeaders.AUTHORIZATION, createAuthorizationsHeaderValue(sdcUser, sdcPassword));
        headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        headers.add(MD5_HEADER, calculateMD5Base64EncodedByString(formattedArtifact));
        headers.add(X_ECOMP_INSTANCE_ID_HEADER, "InstanceId");
        return headers;
    }

    private String calculateMD5Base64EncodedByString(String data) {
        String calculatedMd5 = md5Hex(data);
        // encode base-64 result
        byte[] encodeBase64 = Base64.getEncoder().encode(calculatedMd5.getBytes());
        return new String(encodeBase64);
    }

    private String createAuthorizationsHeaderValue(String username, String password) {
        String auth = username + ":" + password;
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(Charset.forName("US-ASCII")));
        return "Basic " + new String(encodedAuth);
    }
}