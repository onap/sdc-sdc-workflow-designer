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
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.onap.sdc.workflowdesigner.externalservice.sdc.entity.ActivitySpec;
import org.onap.sdc.workflowdesigner.externalservice.sdc.entity.GenericCollectionWrapper;

@Path("")
public interface ActivitySpecService {
  @GET
  @Path("/activity-spec?Filter=Certified")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public GenericCollectionWrapper getActivitySpecs(
      @HeaderParam("USER_ID") String userId,
      @HeaderParam("X-ECOMP-InstanceID") String xEcompInstanceId,
      @HeaderParam("Authorization") String authorization) throws Exception;

  @GET
  @Path("/activity-spec/{id}/versions/{versionId}")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public ActivitySpec getActivitySpec(
      @HeaderParam("USER_ID") String userId,
      @HeaderParam("X-ECOMP-InstanceID") String xEcompInstanceId,
      @HeaderParam("Authorization") String authorization,
      @PathParam("versionId") String versionId,
      @PathParam("id") String id) throws Exception;

}
