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
package org.onap.sdc.workflowdesigner.model;

import java.util.List;

public class Element {
    public enum TYPE {
		startEvent, 
		endEvent, 
		errorStartEvent,
		errorEndEvent,
		serviceTask, 
		scriptTask,
		exclusiveGateway, 
		parallelGateway, 
		restTask, 
		intermediateCatchEvent
    };

    private String id;
    private String name;
    private TYPE type;
    private String documentation;
    private Position position;
    private List<String> connections;

    public String getId() {
        return id;
    }

    public Position getPosition() {
        return position;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    public List<String> getConnections() {
        return connections;
    }

    public void setConnections(List<String> connections) {
        this.connections = connections;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDocumentation() {
        return documentation;
    }

    public void setDocumentation(String documentation) {
        this.documentation = documentation;
    }

    public TYPE getType() {
        return type;
    }

    public void setType(TYPE type) {
        this.type = type;
    }

}
