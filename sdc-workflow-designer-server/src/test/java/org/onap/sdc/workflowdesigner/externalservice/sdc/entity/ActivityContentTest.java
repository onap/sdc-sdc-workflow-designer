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
public class ActivityContentTest {

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
   * Test method for {@link java.lang.Object#toString()}.
   */
  @Test
  public void testToString() {
    String clazz = "clazz";
    String script = "script";
    String scriptFormat = "scriptFormat";
    
    ActivityContent ac = new ActivityContent();
    ac.setClazz(clazz);
    ac.setScript(script);
    ac.setScriptFormat(scriptFormat );
    
    assertEquals(clazz, ac.getClazz());
    assertEquals(script, ac.getScript());
    assertEquals(scriptFormat, ac.getScriptFormat());
  }

}
