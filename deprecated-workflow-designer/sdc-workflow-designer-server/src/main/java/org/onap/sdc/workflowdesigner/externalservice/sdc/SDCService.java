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

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.onap.sdc.workflowdesigner.externalservice.sdc.entity.WorkflowArtifactInfo;

@Path("/catalog")
public interface SDCService {
  @POST
  @Path("/resource/{uuid}/interfaces/{operationID}/artifacts/{id}")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public void saveWorkflowArtifact(@PathParam("uuid") String uuid,
      @PathParam("operationID") String operationId, @PathParam("id") String workflowId,
      @HeaderParam("X-ECOMP-InstanceID") String xEcompInstanceId,
      @HeaderParam("Authorization") String authorization,
      WorkflowArtifactInfo workflowArtifactInfo) throws Exception;
  
  
  @GET
  @Path("/resource/{uuid}/interfaces/{operationID}/artifacts/{id}")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public WorkflowArtifactInfo getWorkflowArtifact(@PathParam("uuid") String uuid,
      @PathParam("operationID") String operationId, @PathParam("id") String workflowId,
      @HeaderParam("X-ECOMP-InstanceID") String xEcompInstanceId,
      @HeaderParam("Authorization") String authorization) throws Exception;

}
