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
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.onap.sdc.workflowdesigner.model.DataObject;
import org.onap.sdc.workflowdesigner.model.Element;
import org.onap.sdc.workflowdesigner.model.EndEvent;
import org.onap.sdc.workflowdesigner.model.ErrorEndEvent;
import org.onap.sdc.workflowdesigner.model.ErrorStartEvent;
import org.onap.sdc.workflowdesigner.model.ExclusiveGateway;
import org.onap.sdc.workflowdesigner.model.IntermediateCatchEvent;
import org.onap.sdc.workflowdesigner.model.ParallelGateway;
import org.onap.sdc.workflowdesigner.model.Parameter;
import org.onap.sdc.workflowdesigner.model.Process;
import org.onap.sdc.workflowdesigner.model.RestServiceTask;
import org.onap.sdc.workflowdesigner.model.ScriptTask;
import org.onap.sdc.workflowdesigner.model.SequenceFlow;
import org.onap.sdc.workflowdesigner.model.ServiceTask;
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
    
    private Map<String, JsonNode> restConfigMap = new HashMap<String, JsonNode>();

    static {
        MAPPER.enable(SerializationFeature.INDENT_OUTPUT);
        MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public Process parse(String processName, URI jsonFileUrl)
            throws JsonParseException, JsonMappingException, MalformedURLException, IOException {
        Process process = new Process(processName);

        JsonNode rootNode = MAPPER.readValue(jsonFileUrl.toURL(), JsonNode.class);

        log.debug("Creating Process models...");
        JsonNode nodes = rootNode.get(JsonKeys.NODES);
        if (nodes == null) {
            return process;
        }
        
        this.loadConfigs(rootNode.get(JsonKeys.CONFIGS));

        Iterator<JsonNode> iter = nodes.iterator();
        while (iter.hasNext()) {
            JsonNode jsonNode = (JsonNode) iter.next();

            // get element
            Element element = createElementFromJson(jsonNode);
            process.getElementList().add(element);

            // get sequence flows
            List<SequenceFlow> flowList = getSequenceFlows(jsonNode);
            process.getSequenceFlowList().addAll(flowList);

            // add dataObject
            if (element instanceof StartEvent) {
                List<DataObject> dataObjects = this.getDataObject((StartEvent) element);
                process.getDataObjectList().addAll(dataObjects);
            }
        }

        return process;

    }

    private List<DataObject> getDataObject(StartEvent startEvent) {
        List<DataObject> dataObjects = new ArrayList<DataObject>();

        for (Parameter parameter : startEvent.getParameters()) {
            DataObject dataObject = new DataObject();
            dataObject.setId(parameter.getName());
            dataObject.setName(parameter.getName());
            dataObject.setValue((String) parameter.getValue());

            dataObjects.add(dataObject);
        }

        return dataObjects;
    }
    
    private void loadConfigs(JsonNode config) {
        if(config == null) {
            return;
        }
        loadRestConfigs(config.get(JsonKeys.REST_CONFIGS));
    }
    
    private void loadRestConfigs(JsonNode restConfigs) {
        if(restConfigs == null) {
            return;
        }
        
        Iterator<JsonNode> iter = restConfigs.iterator();
        while (iter.hasNext()) {
            JsonNode restConfig = (JsonNode) iter.next();

            String configId = getValueFromJsonNode(restConfig, JsonKeys.ID); 
            restConfigMap.put(configId, restConfig);
        }
    }

    private List<SequenceFlow> getSequenceFlows(JsonNode jsonNode) {
        List<SequenceFlow> flowList = new ArrayList<SequenceFlow>();
        JsonNode sequenceFlowNodes = jsonNode.get(JsonKeys.SEQUENCE_FLOWS);

        Iterator<JsonNode> iter = sequenceFlowNodes.iterator();
        while (iter.hasNext()) {
            JsonNode connectionEntry = (JsonNode) iter.next();
            String sourceRef = getValueFromJsonNode(connectionEntry, JsonKeys.SOURCE_REF);
            String targetRef = getValueFromJsonNode(connectionEntry, JsonKeys.TARGET_REF);
            String condition = getValueFromJsonNode(connectionEntry, JsonKeys.CONDITION);
            SequenceFlow flow = new SequenceFlow();
            flow.setId(sourceRef + targetRef);
            flow.setSourceRef(sourceRef);
            flow.setTargetRef(targetRef);
            flow.setCondition(condition);
            flowList.add(flow);
        }

        return flowList;
    }

    protected Element createElementFromJson(JsonNode jsonNode)
            throws JsonParseException, JsonMappingException, IOException {
        String jsonObject = jsonNode.toString();
        Element element;

        String nodeType = getValueFromJsonNode(jsonNode, JsonKeys.TYPE);
        switch (nodeType) {
        case "startEvent":
            element = MAPPER.readValue(jsonObject, StartEvent.class);
            break;
        case "endEvent":
            element = MAPPER.readValue(jsonObject, EndEvent.class);
            break;
        case "errorStartEvent":
            element = MAPPER.readValue(jsonObject, ErrorStartEvent.class);
            break;
        case "errorEndEvent":
            element = MAPPER.readValue(jsonObject, ErrorEndEvent.class);
            break;
        case "intermediateCatchEvent":
            element = MAPPER.readValue(jsonObject, IntermediateCatchEvent.class);
            break;
        case "serviceTask":
            element = MAPPER.readValue(jsonObject, ServiceTask.class);
            break;
        case "restTask":
            element = this.createRestServiceTask(jsonObject);
            break;
        case "scriptTask":
            element = MAPPER.readValue(jsonObject, ScriptTask.class);
            break;
        case "exclusiveGateway":
            element = MAPPER.readValue(jsonObject, ExclusiveGateway.class);
            break;
        case "parallelGateway":
            element = MAPPER.readValue(jsonObject, ParallelGateway.class);
            break;
        default:
            log.warn("Ignoring node: type '" + nodeType + "' is unkown");
            return null;
        }

        return element;
    }
    
    private RestServiceTask createRestServiceTask(String jsonObject) throws JsonParseException, JsonMappingException, IOException {
        RestServiceTask restServiceTask = MAPPER.readValue(jsonObject, RestServiceTask.class);
        
        // add baseUrl to relative url
        String restConfigId = restServiceTask.getRestConfigId();
        JsonNode restConfig = this.restConfigMap.get(restConfigId);
        
        if(restConfig != null) { // while create a new rest task and didnot set method, the restconfig info may be null
            restServiceTask.setUrl(getValueFromJsonNode(restConfig, JsonKeys.MICROSERVICE_URL));
            restServiceTask.setServiceName(getValueFromJsonNode(restConfig, JsonKeys.MICROSERVICE_NAME));
            restServiceTask.setServiceVersion(getValueFromJsonNode(restConfig, JsonKeys.MICROSERVICE_VERSION));
        }
        
        for(Parameter parameter : restServiceTask.getParameters()) {
            if("body".equals(parameter.getPosition())) {
                parameter.setValueSource(null);
            }
        }
        
        return restServiceTask;
    }

    private String getValueFromJsonNode(JsonNode jsonNode, String key) {
        return jsonNode.get(key) == null ? null : jsonNode.get(key).asText();
    }

}
