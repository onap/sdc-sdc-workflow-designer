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

/**
 *
 */
public class ExtendActivityTest {

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
    I18nString displayName = new I18nString();
    I18nString description = new I18nString();
    String type = "";
    IconData icon = new IconData();
    Content content = new Content();

    ExtActivity ea = new ExtActivity();
    ea.setContent(content);
    ea.setDescription(description);
    ea.setDisplayName(displayName);
    ea.setIcon(icon);
    ea.setId(id);
    ea.setType(type);
    
    assertEquals(content, ea.getContent());
    assertEquals(description, ea.getDescription());
    assertEquals(displayName, ea.getDisplayName());
    assertEquals(icon, ea.getIcon());
    assertEquals(id, ea.getId());
    assertEquals(type, ea.getType());

  }

}
