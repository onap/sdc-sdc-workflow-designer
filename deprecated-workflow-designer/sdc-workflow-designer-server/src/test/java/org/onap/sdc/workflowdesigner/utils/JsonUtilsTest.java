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
package org.onap.sdc.workflowdesigner.utils;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.onap.sdc.workflowdesigner.resources.entity.I18nString;

/**
 *
 */
public class JsonUtilsTest {

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
   * Test method for {@link org.onap.sdc.workflowdesigner.utils.JsonUtils#fromJson(java.lang.String, java.lang.Class)}.
   */
  @Test
  public void testFromJson() {
    String i18n = "{\"en_US\":\"Service Task\",\"zh_CN\":\"Service Task\"}";
    I18nString i18nString = JsonUtils.fromJson(i18n, I18nString.class);
    assertNotNull(i18nString);
  }

  /**
   * Test method for {@link org.onap.sdc.workflowdesigner.utils.JsonUtils#toJson(java.lang.Object)}.
   */
  @Test
  public void testToJson() {
    I18nString  i18nString = new I18nString("Service Task", "Service Task");
    String i18n = JsonUtils.toJson(i18nString);
    String expect = "{\"en_US\":\"Service Task\",\"zh_CN\":\"Service Task\"}";
    assertEquals(expect, i18n);
  }

}
