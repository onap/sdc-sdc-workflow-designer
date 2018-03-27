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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 *
 */
public class TimerEventDefinitionTest {

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
    String type = "type";
    String timeDuration = "timeDuration";
    String timeDate = "timeDate";
    String timeCycle = "timeCycle";
    
    TimerEventDefinition ted = new TimerEventDefinition();
    ted.setType(type);
    ted.setTimeDate(timeDate);
    ted.setTimeDuration(timeDuration);
    ted.setTimeCycle(timeCycle);
    
    assertEquals(type, ted.getType());
    assertEquals(timeDate, ted.getTimeDate());
    assertEquals(timeDuration, ted.getTimeDuration());
    assertEquals(timeCycle, ted.getTimeCycle());
  }

}
