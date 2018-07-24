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

import java.util.HashMap;
import java.util.Map;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.onap.sdc.workflowdesigner.utils.JsonUtils;

/**
 *
 */
public class ContentTest {

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
//    String clazz = "clazz";
    String script = "script";
    String scriptFormat = "scriptFormat";
    Map<String, InputOutput> inputs = new HashMap<String, InputOutput>();
    Map<String, InputOutput> outputs = new HashMap<String, InputOutput>();
    
    Content c = new Content();
//    c.setClass(clazz);
    c.setInputs(inputs);
    c.setOutputs(outputs);
    c.setScript(script);
    c.setScriptFormat(scriptFormat);
    
//    assertEquals(clazz, c.getClazz());
    assertEquals(inputs, c.getInputs());
    assertEquals(outputs, c.getOutputs());
    assertEquals(script, c.getScript());
    assertEquals(scriptFormat, c.getScriptFormat());
  }
  
  @Test
  public void testGson() {
    String json = "{\r\n" + 
        "      \"class\": \"aaaa\",\r\n" + 
        "      \"inputs\": {}\r\n" + 
        "    }";
    Content content = JsonUtils.fromJson(json, Content.class);
    assertNotNull(content);
  }

}
