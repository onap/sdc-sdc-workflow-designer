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
package org.onap.sdc.workflowdesigner.model;

import java.util.ArrayList;
import java.util.List;

public class Process {
    private String id;
    private boolean isExecutable;
    private List<Element> elementList = new ArrayList<Element>();
    private List<SequenceFlow> sequenceFlowList = new ArrayList<SequenceFlow>();

    public Process(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public boolean isExecutable() {
        return isExecutable;
    }

    public void setExecutable(boolean isExecutable) {
        this.isExecutable = isExecutable;
    }

    public List<Element> getElementList() {
        return elementList;
    }

    public void setElementList(List<Element> elementList) {
        this.elementList = elementList;
    }

    public List<SequenceFlow> getSequenceFlowList() {
        return sequenceFlowList;
    }

    public void setSequenceFlowList(List<SequenceFlow> sequenceFlowList) {
        this.sequenceFlowList = sequenceFlowList;
    }

}
