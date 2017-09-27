/**
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */
package org.onap.sdc.workflowdesigner.config;

import static org.junit.Assert.assertEquals;

import org.apache.velocity.exception.ParseErrorException;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.junit.Test;

public class ConfigTest {
    @Test
    public void testLoad() throws ResourceNotFoundException, ParseErrorException, Exception {
        assertEquals(Config.PROPERTIES.get(Config.HANDLER_ClASS),
                "org.onap.workflow.activitiext.restservicetask.HttpUtil");
    }
}
