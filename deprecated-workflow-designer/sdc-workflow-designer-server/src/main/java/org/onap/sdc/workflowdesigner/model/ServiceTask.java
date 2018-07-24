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

import java.util.List;

public class ServiceTask extends Element {
	private String className;
	private List<Parameter> inputs;
	private List<Parameter> outputs;

	public String getClassName() {
		return className;
	}

	public void setClassName(String className) {
		this.className = className;
	}

	public List<Parameter> getInputs() {
		return inputs;
	}

	public void setInputs(List<Parameter> inputs) {
		this.inputs = inputs;
	}

	public List<Parameter> getOutputs() {
		return outputs;
	}

	public void setOutputs(List<Parameter> outputs) {
		this.outputs = outputs;
	}
}
