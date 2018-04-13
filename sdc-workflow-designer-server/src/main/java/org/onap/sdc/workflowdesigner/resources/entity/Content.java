/**
 * Copyright (c) 2018 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the Apache License, Version 2.0
 * and the Eclipse Public License v1.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */
package org.onap.sdc.workflowdesigner.resources.entity;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.gson.annotations.SerializedName;

/**
 *
 */
public class Content {
  @JsonProperty(value="class") // for dropwizard's Jackson
  @SerializedName("class")  // for Gson
  public String clazz;
  
  private String script;
  
  private String scriptFormat;
  
  private Map<String, InputOutput> inputs;
  
  private Map<String, InputOutput> outputs;
  

  /**
   * @return the script
   */
  public String getScript() {
    return script;
  }

  /**
   * @param script the script to set
   */
  public void setScript(String script) {
    this.script = script;
  }

  /**
   * @return the scriptFormat
   */
  public String getScriptFormat() {
    return scriptFormat;
  }

  /**
   * @param scriptFormat the scriptFormat to set
   */
  public void setScriptFormat(String scriptFormat) {
    this.scriptFormat = scriptFormat;
  }

  /**
   * @return the inputs
   */
  public Map<String, InputOutput> getInputs() {
    return inputs;
  }

  /**
   * @param inputs the inputs to set
   */
  public void setInputs(Map<String, InputOutput> inputs) {
    this.inputs = inputs;
  }

  /**
   * @return the outputs
   */
  public Map<String, InputOutput> getOutputs() {
    return outputs;
  }

  /**
   * @param outputs the outputs to set
   */
  public void setOutputs(Map<String, InputOutput> outputs) {
    this.outputs = outputs;
  }

}
