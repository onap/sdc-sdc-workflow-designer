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
package org.onap.sdc.workflowdesigner.externalservice.sdc.entity;

/**
 *
 */
public class ActivitySpec {
  private String id;
  
  private String versionId;
  
  private String name;
  
  private String description;
  
  private String type;
  
  private ActivityContent content = new ActivityContent();
  
  private String[] categoryList;

  private Parameter[] inputs;
  
  private Parameter[] outputs;

  private String status;

  /**
   * @return the id
   */
  public String getId() {
    return id;
  }

  /**
   * @param id the id to set
   */
  public void setId(String id) {
    this.id = id;
  }

  /**
   * @return the versionId
   */
  public String getVersionId() {
    return versionId;
  }

  /**
   * @param versionId the versionId to set
   */
  public void setVersionId(String versionId) {
    this.versionId = versionId;
  }

  /**
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * @param name the name to set
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * @return the description
   */
  public String getDescription() {
    return description;
  }

  /**
   * @param description the description to set
   */
  public void setDescription(String description) {
    this.description = description;
  }

  /**
   * @return the type
   */
  public String getType() {
    return type;
  }

  /**
   * @param type the type to set
   */
  public void setType(String type) {
    this.type = type;
  }

  /**
   * @return the content
   */
  public ActivityContent getContent() {
    return content;
  }

  /**
   * @param content the content to set
   */
  public void setContent(ActivityContent content) {
    this.content = content;
  }

  /**
   * @return the categoryList
   */
  public String[] getCategoryList() {
    return categoryList;
  }

  /**
   * @param categoryList the categoryList to set
   */
  public void setCategoryList(String[] categoryList) {
    this.categoryList = categoryList;
  }

  /**
   * @return the inputs
   */
  public Parameter[] getInputs() {
    return inputs;
  }

  /**
   * @param inputs the inputs to set
   */
  public void setInputs(Parameter[] inputs) {
    this.inputs = inputs;
  }

  /**
   * @return the outputs
   */
  public Parameter[] getOutputs() {
    return outputs;
  }

  /**
   * @param outputs the outputs to set
   */
  public void setOutputs(Parameter[] outputs) {
    this.outputs = outputs;
  }

  /**
   * @return the status
   */
  public String getStatus() {
    return status;
  }

  /**
   * @param status the status to set
   */
  public void setStatus(String status) {
    this.status = status;
  }
  
  
}
