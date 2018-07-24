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

package org.onap.sdc.workflowdesigner;

import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.dropwizard.Configuration;

public class WorkflowDesignerConfiguration extends Configuration {
  private String template;

  private String defaultName = "Workflow Designer";
  
  private String adapterType;
  
  @NotNull
  private SDCServiceProxyInfo sdcServiceProxy;

  @NotNull
  private ActivitySpecServiceProxyInfo activitySpecServiceProxy;
  
  
  @JsonProperty
  public String getTemplate() {
    return template;
  }

  @JsonProperty
  public void setTemplate(String template) {
    this.template = template;
  }

  @JsonProperty
  public String getDefaultName() {
    return defaultName;
  }

  @JsonProperty
  public void setDefaultName(String name) {
    this.defaultName = name;
  }
  
  /**
   * @return the adapterType
   */
  @JsonProperty
  public String getAdapterType() {
    return adapterType;
  }

  /**
   * @param adapterType the adapterType to set
   */
  @JsonProperty
  public void setAdapterType(String adapterType) {
    this.adapterType = adapterType;
  }

  /**
   * @return the sdcServiceProxy
   */
  @JsonProperty
  public SDCServiceProxyInfo getSdcServiceProxy() {
    return sdcServiceProxy;
  }

  /**
   * @param sdcServiceProxy the sdcServiceProxy to set
   */
  @JsonProperty
  public void setSdcServiceProxy(SDCServiceProxyInfo sdcServiceProxy) {
    this.sdcServiceProxy = sdcServiceProxy;
  }

  /**
   * @return the activitySpecServiceProxy
   */
  @JsonProperty
  public ActivitySpecServiceProxyInfo getActivitySpecServiceProxy() {
    return activitySpecServiceProxy;
  }

  /**
   * @param activitySpecServiceProxy the activitySpecServiceProxy to set
   */
  @JsonProperty
  public void setActivitySpecServiceProxy(ActivitySpecServiceProxyInfo activitySpecServiceProxy) {
    this.activitySpecServiceProxy = activitySpecServiceProxy;
  }

}
