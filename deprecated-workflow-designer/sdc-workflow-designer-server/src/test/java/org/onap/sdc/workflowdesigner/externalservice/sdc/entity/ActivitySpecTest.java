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
package org.onap.sdc.workflowdesigner.externalservice.sdc.entity;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 *
 */
public class ActivitySpecTest {

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
    String id = "";
    String versionId = "";
    String name = "";
    String description = "";
    String type = "";
    String content = "";
    String[] categoryList = new String[]{"aaa"};
    Parameter[] inputs = new Parameter[0];
    Parameter[] outputs = new Parameter[0];
    String status = "status";
    
    ActivitySpec as = new ActivitySpec();
    as.setId(id);
    as.setVersionId(versionId);
    as.setName(name);
    as.setDescription(description);
    as.setType(type);
    as.setContent(content);
    as.setCategoryList(categoryList);
    as.setInputs(inputs);
    as.setOutputs(outputs);
    as.setStatus(status);
    
    assertEquals(id, as.getId());
    assertEquals(versionId, as.getVersionId());
    assertEquals(name, as.getName());
    assertEquals(description, as.getDescription());
    assertEquals(type, as.getType());
    assertEquals(content, as.getContent());
    assertEquals(categoryList, as.getCategoryList());
    assertEquals(inputs, as.getInputs());
    assertEquals(outputs, as.getOutputs());
    assertEquals(status, as.getStatus());
  }

}
