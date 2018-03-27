/**
 * Copyright (c) 2017-2018 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the Apache License, Version 2.0
 * and the Eclipse Public License v1.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */
package org.onap.sdc.workflowdesigner.convert;

import static org.junit.Assert.assertTrue;

import java.io.File;
import java.net.URI;
import java.nio.file.Paths;

import org.apache.velocity.exception.ParseErrorException;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.junit.Test;
import org.onap.sdc.workflowdesigner.converter.Bpmn4Tosca2Bpmn;

public class BPMN4Tosca2BpmnTest {
    private static String RESOURCES_DIR = "src/test/resources/workflow";

    @Test
    public void testTransform() throws ResourceNotFoundException, ParseErrorException, Exception {

        URI srcUri = Paths.get(RESOURCES_DIR, "workflow.json").toUri();
        URI targetUri = Paths.get(RESOURCES_DIR, "bpmnworkflow.bpmn20.xml").toUri();
        BPMN4Tosca2BpmnTest.class.getResource(".");
        Bpmn4Tosca2Bpmn transformer = new Bpmn4Tosca2Bpmn();
//        transformer.transform("transformTest", srcUri, targetUri);
//        assertTrue(new File(targetUri.getPath()).exists());
        // TODO for Nexus-IQ
    }

}
