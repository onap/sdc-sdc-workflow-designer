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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 *
 */
public class SequenceFlowTest {

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
    String id = "id";
    String name = "name";
    String sourceRef = "sourceRef";
    String targetRef = "targetRef";
    String documentation = "documentation";
    String condition = "condition";
    
    SequenceFlow sf = new SequenceFlow();
    sf.setCondition(condition);
    sf.setDocumentation(documentation);
    sf.setId(id);
    sf.setName(name);
    sf.setSourceRef(sourceRef);
    sf.setTargetRef(targetRef);
    
    assertEquals(condition, sf.getCondition());
    assertEquals(documentation, sf.getDocumentation());
    assertEquals(id, sf.getId());
    assertEquals(name, sf.getName());
    assertEquals(sourceRef, sf.getSourceRef());
    assertEquals(targetRef, sf.getTargetRef());
  }

}
