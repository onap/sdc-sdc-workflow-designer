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

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.onap.sdc.workflowdesigner.model.Element.TYPE;

/**
 *
 */
public class ElementTest {

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
   * Test method for {@link org.onap.sdc.workflowdesigner.model.Element#getType()}
   * 
   */
  @Test
  public final void getType() {
    Element endEvent = new EndEvent();
    System.out.println(endEvent.getType());
    assertEquals(endEvent.getType(), null);
  }
  
  
  @Test
  public void test() {
    String id = "id";
    String name = "name";
    TYPE type = TYPE.endEvent;
    String documentation = "documentation";
    Position position = new Position();
    List<String> connections= new ArrayList<>();
    
    Element e = new Element();
    e.setConnections(connections);
    e.setDocumentation(documentation);
    e.setId(id);
    e.setName(name);
    e.setPosition(position);
    e.setType(type);
    
    assertEquals(connections, e.getConnections());
    assertEquals(documentation, e.getDocumentation());
    assertEquals(id, e.getId());
    assertEquals(name, e.getName());
    assertEquals(position, e.getPosition());
    assertEquals(type, e.getType());
  }

}
