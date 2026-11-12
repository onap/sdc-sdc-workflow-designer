/*-
 * Copyright (C) 2026 Deutsche Telekom AG. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
package org.onap.workflow.web;

import static org.junit.jupiter.api.Assertions.*;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpsConfigurator;
import com.sun.net.httpserver.HttpsParameters;
import com.sun.net.httpserver.HttpsServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyStore;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.ee8.servlet.ServletContextHandler;
import org.eclipse.jetty.ee8.servlet.ServletHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class SSLProxyServletIntegrationTest {
    private static final String PASSWORD = "test-password";
    private static final String[] PROPERTIES = {"proxyTo", "sslTrustAll", "maxPoolConnections",
        "keystorePath", "keystorePassword", "keystoreType", "keyManagerPassword",
        "truststorePath", "truststorePassword", "truststoreType", "endpointIdentificationAlgorithm"};
    @TempDir
    static Path certificates;
    private final Map<String, String> savedProperties = new HashMap<>();
    private final AtomicReference<Received> received = new AtomicReference<>();
    private final HttpClient browser = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private HttpServer upstream;
    private Server frontend;
    private InspectableProxy proxy;
    private String frontendUrl;

    @BeforeAll
    static void certificates() throws Exception {
        for (String name : new String[]{"server", "client", "untrusted"}) {
            keytool("-genkeypair", "-alias", name, "-keyalg", "RSA", "-dname", "CN=localhost",
                "-ext", "SAN=dns:localhost,ip:127.0.0.1", "-validity", "2",
                "-keystore", certificates.resolve(name + ".p12").toString(), "-storetype", "PKCS12",
                "-storepass", PASSWORD, "-keypass", PASSWORD, "-noprompt");
        }
        for (String name : new String[]{"server", "client"}) {
            Path cert = certificates.resolve(name + ".cer");
            keytool("-exportcert", "-alias", name, "-keystore", certificates.resolve(name + ".p12").toString(),
                "-storepass", PASSWORD, "-file", cert.toString());
            keytool("-importcert", "-alias", name, "-keystore", certificates.resolve(name + "-trust.p12").toString(),
                "-storetype", "PKCS12", "-storepass", PASSWORD, "-file", cert.toString(), "-noprompt");
        }
    }

    private static void keytool(String... args) throws Exception {
        java.util.List<String> command = new java.util.ArrayList<>();
        command.add(Path.of(System.getProperty("java.home"), "bin", "keytool").toString());
        java.util.Collections.addAll(command, args);
        Process process = new ProcessBuilder(command).redirectErrorStream(true).start();
        String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        assertEquals(0, process.waitFor(), output);
    }

    @BeforeEach
    void saveProperties() {
        for (String key : PROPERTIES) {
            savedProperties.put(key, System.getProperty(key));
            System.clearProperty(key);
        }
    }

    @AfterEach
    void stop() throws Exception {
        try {
            if (frontend != null) {
                frontend.stop();
                frontend.join();
            }
        } finally {
            if (upstream != null) {
                upstream.stop(0);
            }
            savedProperties.forEach((key, value) -> {
                if (value == null) {
                    System.clearProperty(key);
                } else {
                    System.setProperty(key, value);
                }
            });
        }
    }

    @Test
    void forwardsBothMappingsAndRepeatedQueryParameters() throws Exception {
        startUpstream(false, false);
        startFrontend();
        assertEquals(201, request("GET", "/wf/items?a=1&a=2", new byte[0]).statusCode());
        assertEquals("/base/wf/items?a=1&a=2", received.get().uri);
        assertEquals(201, request("GET", "/v1.0/activity-spec/items", new byte[0]).statusCode());
        assertEquals("/base/v1.0/activity-spec/items", received.get().uri);
    }

    @Test
    void forwardsMethodsBinaryBodiesAndApplicationHeaders() throws Exception {
        startUpstream(false, false);
        startFrontend();
        byte[] body = {0, 1, 2, (byte) 255};
        for (String method : new String[]{"POST", "PUT", "DELETE"}) {
            HttpResponse<byte[]> response = request(method, "/wf/items", body);
            assertEquals(201, response.statusCode());
            assertArrayEquals(body, response.body());
            assertEquals(method, received.get().method);
            assertEquals("Bearer test-token", received.get().authorization);
            assertEquals("test-user", received.get().user);
            assertEquals("127.0.0.1:" + upstream.getAddress().getPort(), received.get().host);
        }
    }

    @Test
    void doesNotFollowUpstreamRedirectsOrShareCookies() throws Exception {
        startUpstream(false, false);
        startFrontend();
        HttpResponse<byte[]> redirect = request("GET", "/wf/redirect", new byte[0]);
        assertEquals(302, redirect.statusCode());
        assertEquals("/different", redirect.headers().firstValue("Location").orElseThrow());
        HttpResponse<byte[]> cookie = request("GET", "/wf/cookie", new byte[0]);
        java.net.HttpCookie parsedCookie = java.net.HttpCookie.parse(
            cookie.headers().firstValue("Set-Cookie").orElseThrow()).get(0);
        assertEquals("session", parsedCookie.getName());
        assertEquals("one", parsedCookie.getValue());
        assertEquals("/", parsedCookie.getPath());
        request("GET", "/wf/items", new byte[0]);
        assertNull(received.get().cookie);
    }

    @Test
    void doesNotForwardConnectionSpecificHeaders() throws Exception {
        startUpstream(false, false);
        startFrontend();
        URI target = URI.create(frontendUrl);
        try (java.net.Socket socket = new java.net.Socket(target.getHost(), target.getPort())) {
            socket.setSoTimeout(10000);
            socket.getOutputStream().write(("GET /workflows/wf/items HTTP/1.1\r\n"
                + "Host: frontend.example\r\nConnection: close, X-Hop\r\n"
                + "X-Hop: private-to-connection\r\n\r\n").getBytes(StandardCharsets.US_ASCII));
            String response = new String(socket.getInputStream().readAllBytes(), StandardCharsets.ISO_8859_1);
            assertTrue(response.startsWith("HTTP/1.1 201"), response);
            assertNull(received.get().hop);
            assertEquals("127.0.0.1:" + upstream.getAddress().getPort(), received.get().host);
        }
    }

    @Test
    void preservesTimeoutsAndPoolOverride() throws Exception {
        System.setProperty("maxPoolConnections", "7");
        startUpstream(false, false);
        startFrontend();
        assertEquals(600000, proxy.getTimeout());
        assertEquals(600000, proxy.client().getIdleTimeout());
        assertEquals(600000, ((org.eclipse.jetty.util.thread.QueuedThreadPool)
            proxy.client().getExecutor()).getStopTimeout());
        assertEquals(7, proxy.client().getMaxConnectionsPerDestination());
    }

    @Test
    void verifiesTrustedUpstreamCertificate() throws Exception {
        configureTrust("server-trust");
        startUpstream(true, false);
        startFrontend();
        assertEquals(201, request("GET", "/wf/items", new byte[0]).statusCode());
    }

    @Test
    void rejectsUntrustedUpstreamCertificate() throws Exception {
        configureTrust("untrusted");
        startUpstream(true, false);
        startFrontend();
        assertEquals(502, request("GET", "/wf/items", new byte[0]).statusCode());
        assertNull(received.get());
    }

    @Test
    void trustsAllOnlyWhenExplicitlyEnabled() throws Exception {
        System.setProperty("sslTrustAll", "true");
        startUpstream(true, false);
        startFrontend();
        assertEquals(201, request("GET", "/wf/items", new byte[0]).statusCode());
    }

    @Test
    void authenticatesWithConfiguredClientKey() throws Exception {
        configureTrust("server-trust");
        System.setProperty("keystorePath", certificates.resolve("client.p12").toString());
        System.setProperty("keystoreType", "PKCS12");
        System.setProperty("keystorePassword", PASSWORD);
        System.setProperty("keyManagerPassword", PASSWORD);
        startUpstream(true, true);
        startFrontend();
        assertEquals(201, request("GET", "/wf/items", new byte[0]).statusCode());
    }

    @Test
    void rejectsMissingClientKey() throws Exception {
        configureTrust("server-trust");
        startUpstream(true, true);
        startFrontend();
        assertEquals(502, request("GET", "/wf/items", new byte[0]).statusCode());
        assertNull(received.get());
    }

    private void configureTrust(String name) {
        System.setProperty("truststorePath", certificates.resolve(name + ".p12").toString());
        System.setProperty("truststoreType", "PKCS12");
        System.setProperty("truststorePassword", PASSWORD);
    }

    private void startUpstream(boolean tls, boolean clientAuth) throws Exception {
        InetSocketAddress address = new InetSocketAddress("127.0.0.1", 0);
        if (tls) {
            HttpsServer https = HttpsServer.create(address, 0);
            KeyStore keys = KeyStore.getInstance("PKCS12");
            try (java.io.InputStream input = Files.newInputStream(certificates.resolve("server.p12"))) {
                keys.load(input, PASSWORD.toCharArray());
            }
            KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
            kmf.init(keys, PASSWORD.toCharArray());
            KeyStore trust = KeyStore.getInstance("PKCS12");
            try (java.io.InputStream input = Files.newInputStream(certificates.resolve("client-trust.p12"))) {
                trust.load(input, PASSWORD.toCharArray());
            }
            TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            tmf.init(trust);
            SSLContext ssl = SSLContext.getInstance("TLS");
            ssl.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);
            https.setHttpsConfigurator(new HttpsConfigurator(ssl) {
                @Override
                public void configure(HttpsParameters parameters) {
                    javax.net.ssl.SSLParameters settings = getSSLContext().getDefaultSSLParameters();
                    settings.setNeedClientAuth(clientAuth);
                    parameters.setSSLParameters(settings);
                }
            });
            upstream = https;
        } else {
            upstream = HttpServer.create(address, 0);
        }
        upstream.createContext("/base", this::respond);
        upstream.start();
        System.setProperty("proxyTo", (tls ? "https" : "http") + "://127.0.0.1:"
            + upstream.getAddress().getPort() + "/base");
    }

    private void respond(HttpExchange exchange) throws IOException {
        byte[] body = exchange.getRequestBody().readAllBytes();
        received.set(new Received(exchange));
        int status = 201;
        if (exchange.getRequestURI().getPath().endsWith("/redirect")) {
            status = 302;
            exchange.getResponseHeaders().add("Location", "/different");
        }
        if (exchange.getRequestURI().getPath().endsWith("/cookie")) {
            exchange.getResponseHeaders().add("Set-Cookie", "session=one; Path=/");
        }
        exchange.sendResponseHeaders(status, body.length == 0 ? -1 : body.length);
        exchange.getResponseBody().write(body);
        exchange.close();
    }

    private void startFrontend() throws Exception {
        frontend = new Server(new InetSocketAddress("127.0.0.1", 0));
        ServletContextHandler context = new ServletContextHandler(frontend, "/workflows");
        proxy = new InspectableProxy();
        ServletHolder holder = new ServletHolder(proxy);
        holder.setAsyncSupported(true);
        holder.setInitParameter("maxThreads", "256");
        context.addServlet(holder, "/wf/*");
        context.getServletHandler().addServletWithMapping(holder, "/v1.0/activity-spec/*");
        frontend.start();
        frontendUrl = "http://127.0.0.1:" + ((ServerConnector) frontend.getConnectors()[0]).getLocalPort()
            + "/workflows";
    }

    private HttpResponse<byte[]> request(String method, String path, byte[] body) throws Exception {
        return browser.send(HttpRequest.newBuilder(URI.create(frontendUrl + path))
            .timeout(Duration.ofSeconds(10)).header("Authorization", "Bearer test-token")
            .header("USER_ID", "test-user").method(method, HttpRequest.BodyPublishers.ofByteArray(body)).build(),
            HttpResponse.BodyHandlers.ofByteArray());
    }

    private static class InspectableProxy extends SSLProxyServlet {
        org.eclipse.jetty.client.HttpClient client() {
            return getHttpClient();
        }
    }

    private static class Received {
        final String uri;
        final String method;
        final String authorization;
        final String user;
        final String host;
        final String cookie;
        final String hop;

        Received(HttpExchange exchange) {
            uri = exchange.getRequestURI().toString();
            method = exchange.getRequestMethod();
            authorization = exchange.getRequestHeaders().getFirst("Authorization");
            user = exchange.getRequestHeaders().getFirst("USER_ID");
            host = exchange.getRequestHeaders().getFirst("Host");
            cookie = exchange.getRequestHeaders().getFirst("Cookie");
            hop = exchange.getRequestHeaders().getFirst("X-Hop");
        }
    }
}
