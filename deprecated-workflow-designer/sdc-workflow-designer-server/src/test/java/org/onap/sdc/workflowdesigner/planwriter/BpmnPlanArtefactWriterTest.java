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
package org.onap.sdc.workflowdesigner.planwriter;

import static org.junit.Assert.assertEquals;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import org.junit.Test;
import org.onap.sdc.workflowdesigner.model.Process;
import org.onap.sdc.workflowdesigner.writer.BpmnPlanArtefactWriter;

public class BpmnPlanArtefactWriterTest {

    @Test
    public void testWritePlan() throws Exception {
        BpmnPlanArtefactWriter writer = new BpmnPlanArtefactWriter(mockProcss());
        String result = writer.completePlanTemplate();
        assertEquals(result, getResult());
    }

    private Process mockProcss() {
        Process process = new Process("templateTest");

        return process;
    }

    public String getResult() throws IOException {
        StringBuffer buffer = new StringBuffer();

        String path = "src/test/resources/workflow/template-test.bpmn20.xml";
        BufferedReader reader = new BufferedReader(new FileReader(new File(path)));

        String line = null;
        while ((line = reader.readLine()) != null) {
            buffer.append(line).append("\r\n");
        }

        if (reader != null) {
            reader.close();
        }

        return buffer.toString();
    }

}
