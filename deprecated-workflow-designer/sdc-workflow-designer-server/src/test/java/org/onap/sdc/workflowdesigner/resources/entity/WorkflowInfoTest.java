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
package org.onap.sdc.workflowdesigner.resources.entity;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.gson.JsonObject;

/**
 *
 */
public class WorkflowInfoTest {

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
    String uuid = "";
    String operationId = "";
    String id = "";
    String name = "";
    String description = "";
    String scene = "";
    JsonObject data =new JsonObject();
    
    WorkflowInfo wi = new WorkflowInfo();
    wi.setData(data);
    wi.setDescription(description);
    wi.setId(id);
    wi.setName(name);
    wi.setOperationId(operationId);
    wi.setScene(scene);
    wi.setUuid(uuid);
    
    assertEquals(data, wi.getData());
    assertEquals(description, wi.getDescription());
    assertEquals(id, wi.getId());
    assertEquals(name, wi.getName());
    assertEquals(operationId, wi.getOperationId());
    assertEquals(scene, wi.getScene());
    assertEquals(uuid, wi.getUuid());
  }

}
