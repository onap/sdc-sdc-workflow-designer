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
package org.onap.sdc.workflowdesigner.resources;

import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Paths;
import java.util.UUID;

import org.dom4j.DocumentException;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.onap.sdc.workflowdesigner.resources.entity.WorkflowInfo;
import org.onap.sdc.workflowdesigner.utils.FileCommonUtils;
import org.onap.sdc.workflowdesigner.utils.JsonUtils;

/**
 *
 */
public class WorkflowModelerResourceTest {
  private static final String WORKFLOW_JSON_TEMP_FILE_NAME = "temp_workflow.json";

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

  /**
   * Test method for {@link org.onap.sdc.workflowdesigner.resources.WorkflowModelerResource#buildBPMN(java.net.URI, java.lang.String)}.
   */
  @Test
  public void testBuildBPMN() {
    String bpmn = parseBpmnfromJsonFile();
    assertEquals(false, bpmn.isEmpty());
  }

  /**
   * @return
   */
  private String parseBpmnfromJsonFile() {
    try {
      URI srcUri = Paths.get("..\\distribution\\src\\main\\assembly", WORKFLOW_JSON_TEMP_FILE_NAME).toUri();
      WorkflowModelerResource resource = new WorkflowModelerResource();
      String processName = "plan_" + UUID.randomUUID().toString();
      return resource.buildBPMN(srcUri, processName);
    } catch (IOException e) {
      e.printStackTrace();
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }
  
  /**
   * Test method for {@link org.onap.sdc.workflowdesigner.resources.WorkflowModelerResource#insertJson2Bpmn(java.lang.String, java.lang.String)}.
   */
  @Test
  public void testInsertJson2Bpmn() {
    String bpmn = parseBpmnfromJsonFile();
    
    try {
      String json = FileCommonUtils.readString("..\\distribution\\src\\main\\assembly\\" + WORKFLOW_JSON_TEMP_FILE_NAME);
      WorkflowModelerResource resource = new WorkflowModelerResource();
      String combineBpmn = resource.insertJson2Bpmn(json, bpmn);

      String json1 = resource.readJsonfromBPMNFile(combineBpmn);
      
      assertEqualsJson(json, json1);
    } catch (IOException e) {
      e.printStackTrace();
    } catch (DocumentException e) {
      e.printStackTrace();
    }
  }

  /**
   * @param json
   * @param json1
   */
  private void assertEqualsJson(String json, String json1) {
    WorkflowInfo wi = JsonUtils.fromJson(json, WorkflowInfo.class);
    WorkflowInfo wi1 = JsonUtils.fromJson(json1, WorkflowInfo.class);
    
    String newJson = JsonUtils.toJson(wi);
    String newJson1 = JsonUtils.toJson(wi1);

    assertEquals(newJson1, newJson);
    
  }

}
