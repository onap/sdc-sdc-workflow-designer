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
package org.onap.sdc.workflowdesigner;

import static org.junit.Assert.*;

import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 *
 */
public class WorkflowDesignerConfigurationTest {

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
    String template = "template";
    String defaultName = "Workflow Designer";
    SDCServiceProxyInfo sdcServiceProxy = new SDCServiceProxyInfo();
    
    
    WorkflowDesignerConfiguration wdc = new WorkflowDesignerConfiguration();
    wdc.setDefaultName(defaultName);
    wdc.setSdcServiceProxy(sdcServiceProxy);
    wdc.setTemplate(template);
    
    assertEquals(defaultName, wdc.getDefaultName());
    assertEquals(sdcServiceProxy, wdc.getSdcServiceProxy());
    assertEquals(template, wdc.getTemplate());
  }

}
