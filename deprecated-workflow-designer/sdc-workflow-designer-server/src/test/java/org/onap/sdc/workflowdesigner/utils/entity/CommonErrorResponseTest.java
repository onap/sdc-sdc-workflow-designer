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
package org.onap.sdc.workflowdesigner.utils.entity;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 *
 */
public class CommonErrorResponseTest {

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
   * Test method for {@link org.onap.sdc.workflowdesigner.utils.entity.CommonErrorResponse#failure(java.lang.String)}.
   */
  @Test
  public void testFailure() {
    String code = "code";
    String message = "message";
    CommonErrorResponse errorResponse = new CommonErrorResponse(code);
    errorResponse.setCode(code);
    errorResponse.setMessage(message);
    assertEquals(code, errorResponse.getCode());
    assertEquals(message, errorResponse.getMessage());
  }

}
