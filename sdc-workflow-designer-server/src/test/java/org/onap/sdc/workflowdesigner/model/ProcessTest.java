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
public class ProcessTest {

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
    boolean isExecutable = false;
    List<Element> elementList = new ArrayList<Element>();
    List<SequenceFlow> sequenceFlowList = new ArrayList<SequenceFlow>();
    List<DataObject> dataObjectList = new ArrayList<DataObject>();
    
    Process p = new Process(id);
    p.setDataObjectList(dataObjectList);
    p.setElementList(elementList);
    p.setExecutable(isExecutable);
    p.setId(id);
    p.setSequenceFlowList(sequenceFlowList);

    assertEquals(dataObjectList, p.getDataObjectList());
    assertEquals(elementList, p.getElementList());
    assertEquals(isExecutable, p.isExecutable());
    assertEquals(id, p.getId());
    assertEquals(sequenceFlowList, p.getSequenceFlowList());
  }

}
