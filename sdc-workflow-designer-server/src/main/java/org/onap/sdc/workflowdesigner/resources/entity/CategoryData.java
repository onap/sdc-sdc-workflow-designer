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
public class CategoryData {
  private I18nString displayName;
  
  private boolean collapse;

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
   * @return the collapse
   */
  public boolean isCollapse() {
    return collapse;
  }

  /**
   * @param collapse the collapse to set
   */
  public void setCollapse(boolean collapse) {
    this.collapse = collapse;
  }
  
}
