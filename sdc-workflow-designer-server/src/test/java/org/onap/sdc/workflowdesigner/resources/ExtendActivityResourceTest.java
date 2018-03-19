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

import javax.ws.rs.core.Response;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.onap.sdc.workflowdesigner.resources.entity.ExtendActivity;
import org.onap.sdc.workflowdesigner.utils.FileCommonUtils;

import com.google.gson.Gson;

/**
 *
 */
public class ExtendActivityResourceTest {

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
   * Test method for {@link org.onap.sdc.workflowdesigner.resources.ExtendActivityResource#getExtActivities(java.lang.String)}.
   */
  @Test
  public void testGetExtActivities() {
    ExtendActivityResource resource = new ExtendActivityResource();
    try {
      Response response = resource.getExtActivities("test");
      ExtendActivity[] extActivities = (ExtendActivity[]) response.getEntity();
      Gson gson = new Gson();
      FileCommonUtils.write("test.json", gson.toJson(extActivities));
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
