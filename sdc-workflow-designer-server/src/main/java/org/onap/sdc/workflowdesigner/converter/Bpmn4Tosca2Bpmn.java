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
package org.onap.sdc.workflowdesigner.converter;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

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
     */
    public void transform(URI srcBpmn4ToscaJsonFile, URI targetBpmnArchive) {
        log.info("transform start");

        // parse json object

        // transform bpmn template

        // write bpmn to file
        log.info("transform end");
    }

    public static Path writeStringToFile(String content, Path targetPath) throws IOException {
        return Files.write(targetPath, content.getBytes(), StandardOpenOption.CREATE_NEW);
    }

}
