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

/**
 *
 */
public class ExtendActivity {
  private String id;
  
  private I18nString displayName;
  
  private I18nString description;
  
  private String type;
  
  private Content content;

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
  public Content getContent() {
    return content;
  }

  /**
   * @param content the content to set
   */
  public void setContent(Content content) {
    this.content = content;
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
   * @return the description
   */
  public I18nString getDescription() {
    return description;
  }

  /**
   * @param description the description to set
   */
  public void setDescription(I18nString description) {
    this.description = description;
  }
  
  

}
