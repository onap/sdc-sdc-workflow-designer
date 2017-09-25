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
package org.onap.sdc.workflowdesigner.parser;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.util.Iterator;

import org.onap.sdc.workflowdesigner.model.Element;
import org.onap.sdc.workflowdesigner.model.Process;
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
	
	public Process parse(String processName, URI jsonFileUrl) throws JsonParseException, JsonMappingException, MalformedURLException, IOException {
		Process process = new Process(processName);

		JsonNode rootNode = MAPPER.readValue(jsonFileUrl.toURL(), JsonNode.class);

		log.debug("Creating Process models...");
		JsonNode nodes = rootNode.get("nodes");
		if(nodes == null) {
			return process;
		}
		
		Iterator<JsonNode> iter = nodes.iterator();
		while (iter.hasNext()) {
			JsonNode jsonNode = (JsonNode) iter.next();

			// get element
			Element element = createElementFromJson(jsonNode);
			process.getElementList().add(element);
		}

		return process;

	}
	
	protected Element createElementFromJson(JsonNode jsonNode) throws JsonParseException, JsonMappingException, IOException {
		String jsonObject = jsonNode.toString();
		return MAPPER.readValue(jsonObject, Element.class);
	}
	
}
