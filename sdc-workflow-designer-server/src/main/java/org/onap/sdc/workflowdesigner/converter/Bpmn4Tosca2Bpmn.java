/**
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the Apache License, Version 2.0
 * and the Eclipse Public License v1.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */
package org.onap.sdc.workflowdesigner.converter;

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

import org.onap.sdc.workflowdesigner.model.Process;
import org.onap.sdc.workflowdesigner.parser.Bpmn4ToscaJsonParser;
import org.onap.sdc.workflowdesigner.writer.BpmnPlanArtefactWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Bpmn4Tosca2Bpmn {

    private static Logger log = LoggerFactory.getLogger(Bpmn4Tosca2Bpmn.class);

    /**
     * Transforms the given BPMN4Tosca Json management into a bpmn plan that can
     * be excuted by activiti.
     * <p>
     *
     * @param srcBpmn4ToscaJsonFile
     * @param targetBpmnArchive
     * @throws Exception 
     */
    public void transform(String processId, URI srcBpmn4ToscaJsonFile, URI targetBpmnArchive) throws Exception {
        log.info("transform start");

        // parse json object
        Bpmn4ToscaJsonParser parser = new Bpmn4ToscaJsonParser();
        Process process = parser.parse(processId, srcBpmn4ToscaJsonFile);

        // transform bpmn template
        BpmnPlanArtefactWriter writer = new BpmnPlanArtefactWriter(process);
        String workflowString = writer.completePlanTemplate();

        // write bpmn to file
        Path targetPath = Paths.get(targetBpmnArchive);
        Files.write(targetPath, workflowString.getBytes(), StandardOpenOption.CREATE);
        log.info("transform end");
    }

}
