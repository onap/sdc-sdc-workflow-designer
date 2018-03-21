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

import com.google.gson.JsonObject;

/**
 *
 */
public class WorkflowInfo {
  private String uuid;
  
  private String operationId;
  
  private String id;
  
  private String name;
  
  private String description;
  
  private String scene;
  
  private JsonObject data;

  /**
   * @return the uuid
   */
  public String getUuid() {
    return uuid;
  }

  /**
   * @param uuid the uuid to set
   */
  public void setUuid(String uuid) {
    this.uuid = uuid;
  }

  /**
   * @return the operationId
   */
  public String getOperationId() {
    return operationId;
  }

  /**
   * @param operationId the operationId to set
   */
  public void setOperationId(String operationId) {
    this.operationId = operationId;
  }

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
   * @return the scene
   */
  public String getScene() {
    return scene;
  }

  /**
   * @param scene the scene to set
   */
  public void setScene(String scene) {
    this.scene = scene;
  }

  /**
   * @return the data
   */
  public JsonObject getData() {
    return data;
  }

  /**
   * @param data the data to set
   */
  public void setData(JsonObject data) {
    this.data = data;
  }

  
}
