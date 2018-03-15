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
package org.onap.sdc.workflowdesigner.parser;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.List;

import org.junit.Test;
import org.onap.sdc.workflowdesigner.model.Element;
import org.onap.sdc.workflowdesigner.model.Position;
import org.onap.sdc.workflowdesigner.model.Process;
import org.onap.sdc.workflowdesigner.model.ScriptTask;
import org.onap.sdc.workflowdesigner.model.SequenceFlow;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;

public class Bpmn4ToscaJsonParserTest {

    private static String RESOURCES_DIR = "src/test/resources/workflow";
    protected static String PROCESS_NAME = "test1";

    @Test
    public void parseTest() throws JsonParseException, JsonMappingException, MalformedURLException, IOException {
        Bpmn4ToscaJsonParser parser = new Bpmn4ToscaJsonParser();
        URI srcUri = Paths.get(RESOURCES_DIR, "workflow.json").toUri();
        Process actualProcess = parser.parse(PROCESS_NAME, srcUri);
        Process expectedProcess = createReferenceProcess();

        assertElements(expectedProcess.getElementList(), actualProcess.getElementList());
        assertSequenceFlows(expectedProcess.getSequenceFlowList(), actualProcess.getSequenceFlowList());
    }

    private static void assertElements(List<Element> expectedElementList, List<Element> actualElementList) {
        assertEquals(expectedElementList.size(), actualElementList.size());

        for (Iterator<Element> iterator = expectedElementList.iterator(); iterator.hasNext();) {
            Element expectedElement = (Element) iterator.next();
            Element actualElement = getElementById(expectedElement.getId(), actualElementList);
            if (actualElement != null) {
                assertElement(expectedElement, actualElement);
            } else {
                fail("Element with id " + expectedElement.getId() + " could not be found");
            }
        }
    }

    private static Element getElementById(String id, List<Element> actualElementList) {
        Iterator<Element> iter = actualElementList.iterator();
        while (iter.hasNext()) {
            Element element = (Element) iter.next();
            if (element.getId().equals(id)) {
                return element;
            }
        }
        return null;
    }

    public static void assertElement(Element expected, Element actual) {
        assertEquals("element: id ", expected.getId(), actual.getId());
        assertEquals("element: name ", expected.getName(), actual.getName());
    }

    public static void assertSequenceFlows(List<SequenceFlow> expectedSequenceList,
            List<SequenceFlow> actualSequenceFlowList) {
        assertEquals(expectedSequenceList.size(), actualSequenceFlowList.size());

        for (Iterator<SequenceFlow> iterator = expectedSequenceList.iterator(); iterator.hasNext();) {
            SequenceFlow expectedElement = (SequenceFlow) iterator.next();
            SequenceFlow actualElement = getSequenceById(expectedElement.getSourceRef(), expectedElement.getTargetRef(),
                    actualSequenceFlowList);
            if (actualElement != null) {
                assertLink(expectedElement, actualElement);
            } else {
                fail("Element with id " + expectedElement.getId() + " could not be found");
            }
        }
    }

    private static SequenceFlow getSequenceById(String sourceRef, String targetRef,
            List<SequenceFlow> actualSequenceFlowList) {
        Iterator<SequenceFlow> iter = actualSequenceFlowList.iterator();
        while (iter.hasNext()) {
            SequenceFlow element = (SequenceFlow) iter.next();
            if (element.getSourceRef().equals(sourceRef) && element.getTargetRef().equals(targetRef)) {
                return element;
            }
        }
        return null;
    }

    public static void assertLink(SequenceFlow expectedLink, SequenceFlow actualLink) {
        assertEquals("Link source: id", expectedLink.getSourceRef(), actualLink.getSourceRef());
        assertEquals("Link target :id", expectedLink.getTargetRef(), actualLink.getTargetRef());
    }

    private static Process createReferenceProcess() {
        Process process = new Process(PROCESS_NAME);
        
        ScriptTask scriptTask = new ScriptTask();
        scriptTask.setId("scriptTask");
        scriptTask.setName("Script Task");
        Position position = new Position();
        position.setLeft(328);
        position.setTop(134);
        scriptTask.setPosition(position);
        scriptTask.setScript("");
        scriptTask.setScriptFormat("JavaScript");
        process.getElementList().add(scriptTask);

        return process;
    }

}
