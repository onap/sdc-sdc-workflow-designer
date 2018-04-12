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
package org.onap.sdc.workflowdesigner.externalservice.sdc;

import org.glassfish.jersey.client.ClientConfig;
import org.onap.sdc.workflowdesigner.common.SDCProxyException;
import org.onap.sdc.workflowdesigner.config.AppConfig;
import org.onap.sdc.workflowdesigner.externalservice.sdc.entity.ActivitySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.eclipsesource.jaxrs.consumer.ConsumerFactory;

/**
 * 
 */
public class ActivitySpecServiceProxy {
  private static final Logger LOGGER = LoggerFactory.getLogger(SDCService.class);

  private static final String AUTHORIZATION = AppConfig.getSdcServiceProxy().getAuthorization();

  private static final String X_ECOMP_INSTANCE_ID =
      AppConfig.getSdcServiceProxy().getxEcompInstanceId();
  /** */
  private static final String ACTIVITY_ROOT_PATH = "/activityspec-api/v1.0";


  private static String getActivityRootPath() {
    return AppConfig.getSdcServiceProxy().getServiceAddr() + ACTIVITY_ROOT_PATH;
  }

  /**
   * @return
   */
  private ActivitySpecService getActivityServiceProxy() {
    ClientConfig config = new ClientConfig();
    return ConsumerFactory.createConsumer(getActivityRootPath(), config, ActivitySpecService.class);
  }


  /**
   * 
   * @return
   * @throws SDCProxyException
   */
  public ActivitySpec[] getActivitySpecs() throws SDCProxyException {
    ActivitySpecService serviceProxy = getActivityServiceProxy();
    try {
      return serviceProxy.getActivitySpecs(X_ECOMP_INSTANCE_ID, AUTHORIZATION);
    } catch (Exception e) {
      LOGGER.error("Get Activity Specifications Failed.", e);
      throw new SDCProxyException("Get Activity Specifications Failed.", e);
    }
  }


}
