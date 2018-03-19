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
package org.onap.sdc.workflowdesigner;

/**
 *
 */
public class SDCServiceProxyInfo {
  private String xEcompInstanceId;
  
  private String authorization;

  /**
   * @return the xEcompInstanceId
   */
  public String getxEcompInstanceId() {
    return xEcompInstanceId;
  }

  /**
   * @param xEcompInstanceId the xEcompInstanceId to set
   */
  public void setxEcompInstanceId(String xEcompInstanceId) {
    this.xEcompInstanceId = xEcompInstanceId;
  }

  /**
   * @return the authorization
   */
  public String getAuthorization() {
    return authorization;
  }

  /**
   * @param authorization the authorization to set
   */
  public void setAuthorization(String authorization) {
    this.authorization = authorization;
  }

}
