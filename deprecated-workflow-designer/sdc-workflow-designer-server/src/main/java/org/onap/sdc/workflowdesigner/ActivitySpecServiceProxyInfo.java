/*
 * Copyright © 2016-2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onap.sdc.workflowdesigner;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 *
 */
public class ActivitySpecServiceProxyInfo {
  private String serviceAddr;
  
  private String xEcompInstanceId;
  
  private String authorization;

  private String userId;

  /**
   * @return the serviceAddr
   */
  @JsonProperty
  public String getServiceAddr() {
    return serviceAddr;
  }

  /**
   * @param serviceAddr the serviceAddr to set
   */
  @JsonProperty
  public void setServiceAddr(String serviceAddr) {
    this.serviceAddr = serviceAddr;
  }

  /**
   * @return the xEcompInstanceId
   */
  @JsonProperty
  public String getxEcompInstanceId() {
    return xEcompInstanceId;
  }

  /**
   * @param xEcompInstanceId the xEcompInstanceId to set
   */
  @JsonProperty
  public void setxEcompInstanceId(String xEcompInstanceId) {
    this.xEcompInstanceId = xEcompInstanceId;
  }

  /**
   * @return the authorization
   */
  @JsonProperty
  public String getAuthorization() {
    return authorization;
  }

  /**
   * @param authorization the authorization to set
   */
  @JsonProperty
  public void setAuthorization(String authorization) {
    this.authorization = authorization;
  }

  /**
   * @return the userId
   */
  @JsonProperty
  public String getUserId() {
    return userId;
  }

  /**
   * @param userId the userId to set
   */
  @JsonProperty
  public void setUserId(String userId) {
    this.userId = userId;
  }

}
