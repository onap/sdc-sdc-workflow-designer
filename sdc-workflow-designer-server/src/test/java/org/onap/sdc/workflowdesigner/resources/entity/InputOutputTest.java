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

import com.google.gson.annotations.SerializedName;

/**
 *
 */
public class InputOutputTest {

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
    String type = "";
    String defaultValue = "";
    boolean required = false;
    I18nString displayName = new I18nString();
    boolean show = true;
    boolean editable = true;
    String value = "";

    InputOutput io = new InputOutput();
    io.setDefault(defaultValue);
    io.setDisplayName(displayName);
    io.setEditable(editable);
    io.setRequired(required);
    io.setShow(show);
    io.setType(type);
    io.setValue(value);
    
    assertEquals(defaultValue, io.getDefault());
    assertEquals(displayName, io.getDisplayName());
    assertEquals(editable, io.isEditable());
    assertEquals(required, io.isRequired());
    assertEquals(show, io.isShow());
    assertEquals(type, io.getType());
    assertEquals(value, io.getValue());
  }

}
