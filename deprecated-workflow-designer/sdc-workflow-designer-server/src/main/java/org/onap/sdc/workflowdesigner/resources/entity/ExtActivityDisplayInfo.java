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

import java.util.HashMap;
import java.util.Map;

/**
 *
 */
public class ExtActivityDisplayInfo {
  private Map<String, NodeCategory> nodes = new HashMap<>();

  private Map<String, CategoryData> categoryData = new HashMap<>();

  /**
   * @return the nodes
   */
  public Map<String, NodeCategory> getNodes() {
    return nodes;
  }

  /**
   * @param nodes the nodes to set
   */
  public void setNodes(Map<String, NodeCategory> nodes) {
    this.nodes = nodes;
  }

  /**
   * @return the categoryData
   */
  public Map<String, CategoryData> getCategoryData() {
    return categoryData;
  }

  /**
   * @param categoryData the categoryData to set
   */
  public void setCategoryData(Map<String, CategoryData> categoryData) {
    this.categoryData = categoryData;
  }

}
