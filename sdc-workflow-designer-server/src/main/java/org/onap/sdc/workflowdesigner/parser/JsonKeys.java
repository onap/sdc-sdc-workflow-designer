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
package org.onap.sdc.workflowdesigner.parser;

public interface JsonKeys {


	/*
	 * Field names of BPMN4Tosca Model
	 */
	public static final String DATA = "data";
	public static final String NODES = "nodes";
	public static final String REST_CONFIGS = "restConfigs";
	public static final String CONFIGS = "configs";
	
	
	// microservice info
	public static final String MICROSERVICE_URL = "url";
	public static final String MICROSERVICE_NAME = "name";
	public static final String MICROSERVICE_VERSION = "version";
	
	public static final String NAME = "name";

	public static final String ID = "id";

	public static final String TYPE = "type";

	public static final String INPUT = "input";

	public static final String OUTPUT = "output";

	public static final String VALUE = "value";

	public static final String NODE_TEMPLATE = "node_template";

	public static final String NODE_OPERATION = "node_operation";

	public static final String NODE_INTERFACE_NAME = "interface";

	public static final String CONNECTIONS = "connection";
	
	public static final String SOURCE_REF = "sourceRef";
	
	public static final String TARGET_REF = "targetRef";
	
	public static final String CONDITIONS = "conditions";
	
	public static final String CONDITION = "condition";
	
	public static final String DEFAULT = "default";


	/*
	 * Exclusive-Gateway, Event, Management-Task Types
	 *
	 */
	public static final String NODE_TYPE_MGMT_TASK = "ToscaNodeManagementTask";

	public static final String NODE_TYPE_START_EVENT = "StartEvent";

	public static final String NODE_TYPE_END_EVENT = "EndEvent";
	
	public static final String NODE_TYPE_GATEWAY_EXCLUSIVE = "ExclusiveGateway";
	
	public static final String NODE_TYPE_GATEWAY_EXCLUSIVE_END = "ExclusiveGatewayEnd";


	/*
	 * Parameter Types
	 */
	public static final String PARAM_TYPE_VALUE_STRING = "string";

	public static final String PARAM_TYPE_VALUE_TOPOLOGY = "topology";

	public static final String PARAM_TYPE_VALUE_PLAN = "plan";

	public static final String PARAM_TYPE_VALUE_CONCAT = "concat";

	public static final String PARAM_TYPE_VALUE_IA = "implementation_artifact";

	public static final String PARAM_TYPE_VALUE_DA = "deployment_artifact";

}
