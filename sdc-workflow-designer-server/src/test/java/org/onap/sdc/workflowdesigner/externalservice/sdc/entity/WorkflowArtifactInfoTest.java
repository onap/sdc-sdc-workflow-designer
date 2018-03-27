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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 *
 */
public class WorkflowArtifactInfoTest {

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
    String artifactName = "artifactName";
    String description = "description";
    String artifactType = "WORKFLOW";
    String payloadData = "payloadData";
    
    WorkflowArtifactInfo wai = new WorkflowArtifactInfo(artifactName, description, payloadData);
    wai.setArtifactName(artifactName);
    wai.setArtifactType(artifactType);
    wai.setDescription(description);
    wai.setPayloadData(payloadData);
    
    assertEquals(artifactName, wai.getArtifactName());
    assertEquals(description, wai.getDescription());
    assertEquals(artifactType, wai.getArtifactType());
    assertEquals(payloadData, wai.getPayloadData());
  }

}
