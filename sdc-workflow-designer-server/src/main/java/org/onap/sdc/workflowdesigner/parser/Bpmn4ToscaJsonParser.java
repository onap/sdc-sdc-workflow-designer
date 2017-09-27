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

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.onap.sdc.workflowdesigner.model.Element;
import org.onap.sdc.workflowdesigner.model.EndEvent;
import org.onap.sdc.workflowdesigner.model.Process;
import org.onap.sdc.workflowdesigner.model.SequenceFlow;
import org.onap.sdc.workflowdesigner.model.StartEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

public class Bpmn4ToscaJsonParser {

    private static Logger log = LoggerFactory.getLogger(Bpmn4ToscaJsonParser.class);

    private static ObjectMapper MAPPER = new ObjectMapper();

    static {
        MAPPER.enable(SerializationFeature.INDENT_OUTPUT);
        MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public Process parse(String processName, URI jsonFileUrl)
            throws JsonParseException, JsonMappingException, MalformedURLException, IOException {
        Process process = new Process(processName);

        JsonNode rootNode = MAPPER.readValue(jsonFileUrl.toURL(), JsonNode.class);

        log.debug("Creating Process models...");
        JsonNode nodes = rootNode.get("nodes");
        if (nodes == null) {
            return process;
        }

        Iterator<JsonNode> iter = nodes.iterator();
        while (iter.hasNext()) {
            JsonNode jsonNode = (JsonNode) iter.next();

            // get element
            Element element = createElementFromJson(jsonNode);
            process.getElementList().add(element);

            // get sequence flows
            List<SequenceFlow> flowList = getSequenceFlows(jsonNode);
            process.getSequenceFlowList().addAll(flowList);
        }

        return process;

    }

    private List<SequenceFlow> getSequenceFlows(JsonNode jsonNode) {
        List<SequenceFlow> flowList = new ArrayList<SequenceFlow>();
        JsonNode sequenceFlowNodes = jsonNode.get("sequenceFlows");

        Iterator<JsonNode> iter = sequenceFlowNodes.iterator();
        while (iter.hasNext()) {
            JsonNode connectionEntry = (JsonNode) iter.next();
            String sourceRef = getValueFromJsonNode(connectionEntry, "sourceRef");
            String targetRef = getValueFromJsonNode(connectionEntry, "targetRef");
            String condition = getValueFromJsonNode(connectionEntry, "condition");
            SequenceFlow flow = new SequenceFlow();
            flow.setId(sourceRef + targetRef);
            flow.setSourceRef(sourceRef);
            flow.setTargetRef(targetRef);
            flow.setCondition(condition);
            flowList.add(flow);
        }

        return flowList;
    }

    private String getValueFromJsonNode(JsonNode jsonNode, String key) {
        return jsonNode.get(key) == null ? null : jsonNode.get(key).asText();
    }

    protected Element createElementFromJson(JsonNode jsonNode)
            throws JsonParseException, JsonMappingException, IOException {
        String jsonObject = jsonNode.toString();
        Element element;

        String nodeType = getValueFromJsonNode(jsonNode, "type");
        switch (nodeType) {
        case "startEvent":
            element = MAPPER.readValue(jsonObject, StartEvent.class);
            break;
        case "endEvent":
            element = MAPPER.readValue(jsonObject, EndEvent.class);
            break;
        default:
            log.warn("Ignoring node: type '" + nodeType + "' is unkown");
            return null;
        }

        return element;
    }

}
