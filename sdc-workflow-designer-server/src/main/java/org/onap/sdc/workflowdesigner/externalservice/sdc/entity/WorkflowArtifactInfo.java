/**
 * Copyright 2018 ZTE Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.onap.sdc.workflowdesigner.externalservice.sdc.entity;

import java.io.Serializable;

public class WorkflowArtifactInfo implements Serializable {
  public static final long serialVersionUID = 1L;

  private String artifactName;
  
  private String description;
  
  private String artifactType = "WORKFLOW";
  
  private String payloadData;
  

  /**
   * @param artifactName
   * @param description
   * @param artifactType
   * @param payloadData
   */
  public WorkflowArtifactInfo(String artifactName, String description, String artifactType,
      String payloadData) {
    super();
    this.artifactName = artifactName;
    this.description = description;
    this.artifactType = artifactType;
    this.payloadData = payloadData;
  }

  /**
   * @return the artifactName
   */
  public String getArtifactName() {
    return artifactName;
  }

  /**
   * @param artifactName the artifactName to set
   */
  public void setArtifactName(String artifactName) {
    this.artifactName = artifactName;
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
   * @return the artifactType
   */
  public String getArtifactType() {
    return artifactType;
  }

  /**
   * @param artifactType the artifactType to set
   */
  public void setArtifactType(String artifactType) {
    this.artifactType = artifactType;
  }

  /**
   * @return the payloadData
   */
  public String getPayloadData() {
    return payloadData;
  }

  /**
   * @param payloadData the payloadData to set
   */
  public void setPayloadData(String payloadData) {
    this.payloadData = payloadData;
  }

  /**
   * @return the serialversionuid
   */
  public static long getSerialversionuid() {
    return serialVersionUID;
  }

}
