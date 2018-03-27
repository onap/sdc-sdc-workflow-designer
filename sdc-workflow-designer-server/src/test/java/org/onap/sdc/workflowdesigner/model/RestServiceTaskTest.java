/**
 * Copyright (c) 2018 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the Apache License, Version 2.0
 * and the Eclipse Public License v1.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */
package org.onap.sdc.workflowdesigner.model;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 *
 */
public class RestServiceTaskTest {

  /**
   * @throws java.lang.Exception
   */
  @Before
  public void setUp() throws Exception {}

  /**
   * @throws java.lang.Exception
   */
  @After
  public void tearDown() throws Exception {}

  @Test
  public void test() {
    List<String> produces = new ArrayList<>();
    List<String> consumes = new ArrayList<>();
    List<Parameter> parameters = new ArrayList<>();
    String baseUrl = "";
    String serviceName = "";
    String serviceVersion = "";
    String path = "";
    String method = "";
    
    RestServiceTask rst = new RestServiceTask();
    rst.setProduces(produces);
    rst.setConsumes(consumes);
    rst.setParameters(parameters);
    rst.setBaseUrl(baseUrl);
    rst.setServiceName(serviceName);
    rst.setServiceVersion(serviceVersion);
    rst.setPath(path);
    rst.setMethod(method);
    
    assertEquals(produces, rst.getProduces());
    assertEquals(consumes, rst.getConsumes());
    assertEquals(parameters, rst.getParameters());
    assertEquals(baseUrl, rst.getBaseUrl());
    assertEquals(serviceName, rst.getServiceName());
    assertEquals(serviceVersion, rst.getServiceVersion());
    assertEquals(path, rst.getPath());
    assertEquals(method, rst.getMethod());
  }

}
