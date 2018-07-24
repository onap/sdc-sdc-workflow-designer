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

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.glassfish.jersey.client.ClientConfig;
import org.onap.sdc.workflowdesigner.common.ActivitySpecProxyException;
import org.onap.sdc.workflowdesigner.config.AppConfig;
import org.onap.sdc.workflowdesigner.externalservice.sdc.entity.ActivitySpec;
import org.onap.sdc.workflowdesigner.externalservice.sdc.entity.GenericCollectionWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.eclipsesource.jaxrs.consumer.ConsumerFactory;

/**
 * 
 */
public class ActivitySpecServiceProxy {
  private static final Logger LOGGER = LoggerFactory.getLogger(ActivitySpecServiceProxy.class);

  private static final String AUTHORIZATION = AppConfig.getActivitySpecServiceProxy().getAuthorization();

  private static final String X_ECOMP_INSTANCE_ID = AppConfig.getActivitySpecServiceProxy().getxEcompInstanceId();

  private static final String USER_ID = AppConfig.getActivitySpecServiceProxy().getUserId();

  /** */
  private static final String ACTIVITY_ROOT_PATH = "/activity-spec-api/v1.0";

  private static final String ACTIVITY_SPEC_VERSION_ID_DEFAULT_VALUE = "latest";

  private static String getActivityRootPath() {
    return AppConfig.getActivitySpecServiceProxy().getServiceAddr() + ACTIVITY_ROOT_PATH;
  }

  /**
   * @return
   */
  private ActivitySpecService getActivitySpecServiceProxy() {
    ClientConfig config = new ClientConfig();
    return ConsumerFactory.createConsumer(getActivityRootPath(), config, ActivitySpecService.class);
  }


  /**
   * 
   * @return
   * @throws ActivitySpecProxyException
   */
  public ActivitySpec[] getActivitySpecs() throws ActivitySpecProxyException {
    ActivitySpecService serviceProxy = getActivitySpecServiceProxy();
    List<ActivitySpec> activitySpecList = new ArrayList<>();
    try {
      GenericCollectionWrapper activityCollection = serviceProxy.getActivitySpecs(USER_ID, X_ECOMP_INSTANCE_ID, AUTHORIZATION);
      for (Object obj : activityCollection.getResults()) {
        if (obj instanceof Map){
          Map activitySpecMap = (Map) obj;
          String activitySpecId = activitySpecMap.get("id").toString();
          ActivitySpec activitySpec = serviceProxy.getActivitySpec(USER_ID, X_ECOMP_INSTANCE_ID, AUTHORIZATION, ACTIVITY_SPEC_VERSION_ID_DEFAULT_VALUE, activitySpecId);
          activitySpec.setId(activitySpecId);
          activitySpecList.add(activitySpec);
        }
      }
    } catch (Exception e) {
      LOGGER.error("Get Activity Specifications Failed.", e);
      throw new ActivitySpecProxyException("Get Activity Specifications Failed.", e);
    }
    return activitySpecList.toArray(new ActivitySpec[activitySpecList.size()]);
  }


}
