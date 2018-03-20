/**
 * Copyright 2017-2018 ZTE Corporation.
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
import org.onap.sdc.workflowdesigner.common.WorkflowDesignerException;
import org.onap.sdc.workflowdesigner.config.AppConfig;
import org.onap.sdc.workflowdesigner.externalservice.sdc.entity.WorkflowArtifactInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.eclipsesource.jaxrs.consumer.ConsumerFactory;

/**
 * 
 */
public class SDCServiceProxy {
  private static final Logger LOGGER = LoggerFactory.getLogger(SDCService.class);

  private static final String AUTHORIZATION = AppConfig.getSdcServiceProxy().getAuthorization();

  private static final String X_ECOMP_INSTANCE_ID = AppConfig.getSdcServiceProxy().getxEcompInstanceId();
  /** */
  private static final String SDC_ROOT_PATH = "/sdc/v1";
  

  private static String getSDCRootPath() {
    return AppConfig.getSdcServiceProxy().getServiceAddr() + SDC_ROOT_PATH;
  }
  
  /**
   * @return
   */
  private SDCService getSDCServiceProxy() {
    ClientConfig config = new ClientConfig();
    SDCService sdcServiceProxy =
        ConsumerFactory.createConsumer(getSDCRootPath(), config, SDCService.class);
    return sdcServiceProxy;
  }

  /**
   * 
   * @param uuid
   * @param operationId
   * @param workflowId
   * @param workflowArtifactInfo
   * @throws WorkflowDesignerException
   */
  public void saveWorkflowArtifact(String uuid, String operationId, String workflowId,
      WorkflowArtifactInfo workflowArtifactInfo) throws WorkflowDesignerException {
    SDCService sdcServiceProxy = getSDCServiceProxy();
    try {
      sdcServiceProxy.saveWorkflowArtifact(uuid, operationId, workflowId,
          X_ECOMP_INSTANCE_ID,
          AUTHORIZATION, workflowArtifactInfo);
    } catch (Exception e) {
      LOGGER.error("Save WorkflowArtifact Failed.", e);
      throw new WorkflowDesignerException("Save WorkflowArtifact Failed.", e);
    }
  }

  /**
   * 
   * @param uuid
   * @param operationId
   * @param workflowId
   * @return
   * @throws WorkflowDesignerException
   */
  public WorkflowArtifactInfo getWorkflowArtifact(String uuid, String operationId,
      String workflowId) throws WorkflowDesignerException {
    SDCService sdcServiceProxy = getSDCServiceProxy();
    try {
      return sdcServiceProxy.getWorkflowArtifact(uuid, operationId, workflowId,
          X_ECOMP_INSTANCE_ID,
          AUTHORIZATION);
    } catch (Exception e) {
      LOGGER.error("Get WorkflowArtifact Failed.", e);
      throw new WorkflowDesignerException("Save WorkflowArtifact Failed.", e);
    }
  }


}
