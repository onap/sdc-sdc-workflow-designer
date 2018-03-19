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

import org.hibernate.validator.constraints.NotEmpty;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.dropwizard.Configuration;

public class WorkflowDesignerConfiguration extends Configuration {
  @NotEmpty
  private String template;

  @NotEmpty
  private String defaultName = "Workflow Designer";
  
  @NotEmpty
  private String msbServerAddr;
  
  @NotEmpty
  private SDCServiceProxyInfo sdcServiceProxy;

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
  
  @JsonProperty
  public String getMsbServerAddr() {
      return msbServerAddr;
  }

  @JsonProperty
  public void setMsbServerAddr(String msbServerAddr) {
      this.msbServerAddr = msbServerAddr;
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

}
