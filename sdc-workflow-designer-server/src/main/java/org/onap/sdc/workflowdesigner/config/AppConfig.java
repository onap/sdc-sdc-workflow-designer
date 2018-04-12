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
package org.onap.sdc.workflowdesigner.config;

import org.onap.sdc.workflowdesigner.SDCServiceProxyInfo;

/**
 * 
 */
public class AppConfig {
  private static AdapterType adapterType;
  
  private static SDCServiceProxyInfo sdcServiceProxy;
  
  private AppConfig() {}

  /**
   * @return the adapterType
   */
  public static AdapterType getAdapterType() {
    return adapterType;
  }

  /**
   * @param adapterType the adapterType to set
   */
  public static void setAdapterType(AdapterType adapterType) {
    AppConfig.adapterType = adapterType;
  }

  /**
   * @param sdcServiceProxy
   */
  public static void setSdcServiceProxy(SDCServiceProxyInfo sdcServiceProxy) {
    AppConfig.sdcServiceProxy = sdcServiceProxy;
  }

  /**
   * @return the sdcServiceProxy
   */
  public static SDCServiceProxyInfo getSdcServiceProxy() {
    return sdcServiceProxy;
  }

  /**
   * @return
   */
  public static boolean isSDCAdapter() {
    return adapterType.equals(AdapterType.SDC);
  }

}
