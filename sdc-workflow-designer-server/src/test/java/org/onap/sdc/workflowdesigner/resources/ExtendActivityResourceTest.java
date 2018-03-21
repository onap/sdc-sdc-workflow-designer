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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.onap.sdc.workflowdesigner.resources.entity.ExtendActivity;
import org.onap.sdc.workflowdesigner.utils.FileCommonUtils;
import org.onap.sdc.workflowdesigner.utils.JsonUtils;

/**
 *
 */
public class ExtendActivityResourceTest {
  private static final String EXT_ACTIVITIES_FILE_NAME = "src\\main\\assembly\\ext-activities.json";

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
   * Test method for {@link org.onap.sdc.workflowdesigner.resources.ExtendActivityResource#retriveExtActivites(java.lang.String)}.
   */
  @Test
  public void testRetriveExtActivites() {
    try {
      String json = FileCommonUtils.readString(EXT_ACTIVITIES_FILE_NAME);
      ExtendActivity[] extActivities = JsonUtils.fromJson(json, ExtendActivity[].class);
      
      FileCommonUtils.write("test.json", JsonUtils.toJson(extActivities));
      assertEquals(extActivities.length == 0, false);
    } catch (Exception e) {
      e.printStackTrace();
    }

  }

  /**
   * Test method for {@link org.onap.sdc.workflowdesigner.resources.ExtendActivityResource#getDisplayInfo(java.lang.String)}.
   */
  @Test
  public void testGetDisplayInfo() {

  }

}
