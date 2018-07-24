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

import com.google.gson.annotations.SerializedName;

/**
 *
 */
public class InputOutput {
  private String type;
  
  @SerializedName("default")
  private String defaultValue;
  
  private boolean required;
  
  private I18nString displayName;
  
  private boolean show = true;
  
  private boolean editable = true;
  
  private String value;
  

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
   * @return the defaultValue
   */
  public String getDefault() {
    return defaultValue;
  }

  /**
   * @param defaultValue the defaultValue to set
   */
  public void setDefault(String defaultValue) {
    this.defaultValue = defaultValue;
  }

  /**
   * @return the required
   */
  public boolean isRequired() {
    return required;
  }

  /**
   * @param required the required to set
   */
  public void setRequired(boolean required) {
    this.required = required;
  }

  /**
   * @return the displayName
   */
  public I18nString getDisplayName() {
    return displayName;
  }

  /**
   * @param displayName the displayName to set
   */
  public void setDisplayName(I18nString displayName) {
    this.displayName = displayName;
  }

  /**
   * @return the show
   */
  public boolean isShow() {
    return show;
  }

  /**
   * @param show the show to set
   */
  public void setShow(boolean show) {
    this.show = show;
  }

  /**
   * @return the editable
   */
  public boolean isEditable() {
    return editable;
  }

  /**
   * @param editable the editable to set
   */
  public void setEditable(boolean editable) {
    this.editable = editable;
  }

  /**
   * @return the value
   */
  public String getValue() {
    return value;
  }

  /**
   * @param value the value to set
   */
  public void setValue(String value) {
    this.value = value;
  }


}
