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

public interface JsonKeys {
    // workflow keys
    public static final String NODES = "nodes";
    public static final String CONFIGS = "configs";
    
    // configs keys
    public static final String REST_CONFIGS = "restConfigs";
    public static final String TYPE = "type";
    
    // workflow node keys
    public static final String SEQUENCE_FLOWS = "sequenceFlows";
    
    // sequence flow keys
    public static final String SOURCE_REF = "sourceRef";
    public static final String TARGET_REF = "targetRef";
    public static final String CONDITION = "condition";
    
    
 // microservice info
    public static final String MICROSERVICE_URL = "url";
    public static final String MICROSERVICE_NAME = "name";
    public static final String MICROSERVICE_VERSION = "version";
    
    public static final String ID = "id";
}
