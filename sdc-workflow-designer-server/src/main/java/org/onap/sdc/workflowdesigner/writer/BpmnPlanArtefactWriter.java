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
package org.onap.sdc.workflowdesigner.writer;

import java.io.StringWriter;

import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.exception.ParseErrorException;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.onap.sdc.workflowdesigner.config.Config;
import org.onap.sdc.workflowdesigner.model.Process;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BpmnPlanArtefactWriter {

    private Process process;

    public static String TEMPLATE_PATH = Config.PROPERTIES.getProperty(Config.TEMPLATE_PATH);

    private static Logger log = LoggerFactory.getLogger(BpmnPlanArtefactWriter.class);

    public BpmnPlanArtefactWriter(Process process) throws Exception {
        this.process = process;
        Velocity.init();
    }

    public String completePlanTemplate() throws ResourceNotFoundException, ParseErrorException, Exception {
        log.debug("Completing BPMN process template...");

        VelocityContext context = new VelocityContext();

        VelocityEngine ve = new VelocityEngine();
        ve.setProperty("resource.loader", "class");
        ve.setProperty("class.resource.loader.class",
                "org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader");
        Template planTemplate = ve.getTemplate(TEMPLATE_PATH + "bpmn_template.xml");

        context.put("process", process);
        context.put("templatePath", TEMPLATE_PATH);
        StringWriter planWriter = new StringWriter();
        planTemplate.merge(context, planWriter);

        String bpmnProcessContent = planWriter.toString();

        log.debug("Completed BPMN process template" + bpmnProcessContent);

        return bpmnProcessContent;

    }

}
