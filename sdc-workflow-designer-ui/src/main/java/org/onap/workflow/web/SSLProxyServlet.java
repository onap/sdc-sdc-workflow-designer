/*-
 * ============LICENSE_START=======================================================
 * SDC
 * ================================================================================
 * Copyright (C) 2017 AT&T Intellectual Property. All rights reserved.
 * ================================================================================
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
 * ============LICENSE_END=========================================================
 */


package org.onap.workflow.web;


import java.net.MalformedURLException;
import java.net.URL;
import java.util.Enumeration;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.jetty.client.HttpClient;
import org.eclipse.jetty.client.api.Request;
import org.eclipse.jetty.client.dynamic.HttpClientTransportDynamic;
import org.eclipse.jetty.http.HttpFields;
import org.eclipse.jetty.http.HttpHeader;
import org.eclipse.jetty.http.HttpScheme;
import org.eclipse.jetty.io.ClientConnector;
import org.eclipse.jetty.proxy.ProxyServlet;
import org.eclipse.jetty.util.URIUtil;
import org.eclipse.jetty.util.ssl.SslContextFactory;


/***
 * Class that provides the proxy implementation for both secured and unsecured backend connections.
 *
 * The following nevironment value is mandatory:
 * proxyTo - the full URL to the backend server (including protocol and context path if relevant)
 *
 * In case of a secured connection (proxyTo starting with https) the following may be set:
 * sslTrustAll - set to true if all secure connection are accepted
 * maxPoolConnections - number of connection in the pool, only when overriding the jetty default
 *
 * In case of SSL and nto trusting all certificates:
 * keystorePath - path to the keystore
 * keystoreType - type of the keystore
 * keystorePassword - keystore password
 *
 * truststorePath - path to the truststore
 * truststoreType - type of the truststore
 * truststorePassword - truststore password

 */

public class SSLProxyServlet extends ProxyServlet {


    public static final int TIMEOUT = 600000;
    protected static final String PROXY_TO = "proxyTo";
    protected static final String TRUST_ALL = "sslTrustAll";
    protected static final String MAX_POOL_CONNECTIONS = "maxPoolConnections";
    protected static final String KEYSTORE_PATH = "keystorePath";
    protected static final String KEYSTORE_TYPE = "keystoreType";
    protected static final String KEYSTORE_P = "keystorePassword";
    protected static final String KEYMANAGER_P = "keyManagerPassword";
    protected static final String KEYSTORE_CYPHER = "keystoreCypher";
    protected static final String TRUSTSTORE_PATH = "truststorePath";
    protected static final String TRUSTSTORE_TYPE = "truststoreType";
    protected static final String TRUSTSTORE_P = "truststorePassword";
    protected static final String ENDPOINT_IDENTIFICATION_ALGORITHM = "endpointIdentificationAlgorithm";
    private static final long serialVersionUID = 1L;
    private static URL proxyUrl = null;


    private static void setProxyUrl(URL proxy) {
        SSLProxyServlet.proxyUrl = proxy;
    }

    private void initProxyUrl() throws ServletException, MalformedURLException {

        if (SSLProxyServlet.proxyUrl != null) {
            return;
        }
        String proxyUrlStr = System.getProperty(PROXY_TO);
        if (proxyUrlStr == null) {
            throw new ServletException("-D" + PROXY_TO + " must be specified");
        }
        setProxyUrl(new URL(proxyUrlStr));
    }


    @Override
    public void init() throws ServletException {
        super.init();
        try {
            initProxyUrl();
        } catch (MalformedURLException e) {
            throw new ServletException(e);
        }
    }


    @Override
    public void sendProxyRequest(HttpServletRequest request, HttpServletResponse response, Request proxyRequest) {

        @SuppressWarnings("unchecked")
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (!proxyRequest.getHeaders().contains(headerName)) {
                String headerVal = request.getHeader(headerName);
                proxyRequest.header(headerName, headerVal);
            }
        }
        ((HttpFields.Mutable) proxyRequest.getHeaders()).remove(HttpHeader.HOST);
        super.sendProxyRequest(request, response, proxyRequest);

    }

    @Override
    protected HttpClient newHttpClient() {
        // ioverride parent method to be able to create a secured client as well.
        boolean isSecureClient = (
            proxyUrl.getProtocol() != null &&
                proxyUrl.getProtocol().equalsIgnoreCase(HttpScheme.HTTPS.toString()));
        if ((isSecureClient)) {
            String trustAll = System.getProperty(TRUST_ALL);
            SslContextFactory.Client sslContextFactory = null;
            if (trustAll != null && Boolean.parseBoolean(trustAll) == Boolean.TRUE) {
                sslContextFactory = new SslContextFactory.Client(true);
            } else {
                sslContextFactory = new SslContextFactory.Client(false);
                // setting up truststore
                sslContextFactory.setTrustStorePath(System.getProperty(TRUSTSTORE_PATH));
                sslContextFactory.setTrustStorePassword(System.getProperty(TRUSTSTORE_P));
                sslContextFactory.setTrustStoreType(System.getProperty(TRUSTSTORE_TYPE));
                // setting up keystore
                sslContextFactory.setKeyStorePath(System.getProperty(KEYSTORE_PATH));
                sslContextFactory.setKeyStorePassword(System.getProperty(KEYSTORE_P));
                sslContextFactory.setKeyStoreType(System.getProperty(KEYSTORE_TYPE));
                sslContextFactory.setKeyManagerPassword(System.getProperty(KEYMANAGER_P));

                if (System.getProperty(ENDPOINT_IDENTIFICATION_ALGORITHM) != null &&
                    !System.getProperty(ENDPOINT_IDENTIFICATION_ALGORITHM).equals("")) {
                    sslContextFactory
                        .setEndpointIdentificationAlgorithm(System.getProperty(ENDPOINT_IDENTIFICATION_ALGORITHM));
                }

                if (System.getProperty(KEYSTORE_CYPHER) != null &&
                    !System.getProperty(KEYSTORE_CYPHER).equals("")) {
                    sslContextFactory.setIncludeCipherSuites(System.getProperty(KEYSTORE_CYPHER));
                }
            }
            ClientConnector clientConnector = new ClientConnector();
            clientConnector.setSslContextFactory(sslContextFactory);
            return new HttpClient(new HttpClientTransportDynamic(clientConnector));

        } else {
            return super.newHttpClient();
        }

    }

    @Override
    protected HttpClient createHttpClient() throws ServletException {

        try {
            initProxyUrl();
        } catch (MalformedURLException e) {
            throw new ServletException(e);
        }
        // calling the parent and setting the configuration for our implementation
        HttpClient client = super.createHttpClient();
        setTimeout(TIMEOUT);
        client.setIdleTimeout(TIMEOUT);
        if (System.getProperty(MAX_POOL_CONNECTIONS) != null) {
            client.setMaxConnectionsPerDestination(
                Integer.valueOf(System.getProperty(MAX_POOL_CONNECTIONS)));
        }
        return client;

    }


    @Override
    protected String rewriteTarget(HttpServletRequest request) {

        String path = proxyUrl.getPath();
        if (request.getServletPath() != null) {
            path += request.getServletPath();
        }
        if (request.getPathInfo() != null) {
            path += request.getPathInfo();
        }

        return URIUtil.newURI(
            proxyUrl.getProtocol(),
            proxyUrl.getHost(),
            proxyUrl.getPort(),
            path,
            request.getQueryString());
    }

}
