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

import org.onap.sdc.workflowdesigner.config.Config;

public class RestServiceTask extends ServiceTask {
    private static String handler = Config.PROPERTIES.getProperty(Config.HANDLER_ClASS);
	
	private String restConfigId;
	public String getRestConfigId() {
		return restConfigId;
	}
	public void setRestConfigId(String restConfigId) {
		this.restConfigId = restConfigId;
	}
	private List<String> produces;
	private List<String> consumes;
	
	
	private List<Parameter> parameters;
	private String url;
	private String serviceName;
	private String serviceVersion;
	private String path;
	private String method;
	
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	
	public String getMethod() {
		return method;
	}
	
	public static String getHandler() {
		return handler;
	}
	public static void setHandler(String handler) {
		RestServiceTask.handler = handler;
	}
	public void setMethod(String method) {
		this.method = method;
	}
	public List<String> getProduces() {
		return produces;
	}
	public void setProduces(List<String> produces) {
		this.produces = produces;
	}
	public List<String> getConsumes() {
		return consumes;
	}
	public void setConsumes(List<String> consumes) {
		this.consumes = consumes;
	}
	public List<Parameter> getParameters() {
		return parameters;
	}
	public void setParameters(List<Parameter> parameters) {
		this.parameters = parameters;
	}
	public String getServiceName() {
		return serviceName;
	}
	public void setServiceName(String serviceName) {
		this.serviceName = serviceName;
	}
	public String getServiceVersion() {
		return serviceVersion;
	}
	public void setServiceVersion(String serviceVersion) {
		this.serviceVersion = serviceVersion;
	}
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
}
