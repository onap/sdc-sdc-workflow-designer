/**
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the Apache License, Version 2.0
 * and the Eclipse Public License v1.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */

package org.onap.sdc.workflowdesigner.resources;

import java.io.IOException;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.jetty.http.HttpStatus;
import org.onap.sdc.workflowdesigner.resources.entity.ExtendActivity;
import org.onap.sdc.workflowdesigner.utils.FileCommonUtils;
import org.onap.sdc.workflowdesigner.utils.RestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codahale.metrics.annotation.Timed;
import com.google.gson.Gson;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

/**
 * Extend Activity Resource.
 * 
 */
@Path("/ext-activities")
@Api(tags = {"Workflow Modeler"})
public class ExtendActivityResource {
  private static final Logger LOGGER = LoggerFactory.getLogger(ExtendActivityResource.class);

  private static final String EXT_ACTIVITIES_FILE_NAME = "..\\distribution\\src\\main\\assembly\\ext-activities.json";

  /**
   * test function.
   * 
   * @return Response
   */
  @Path("/")
  @GET
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @ApiOperation(value = "Get Model", response = ExtendActivity.class, responseContainer = "List")
  @ApiResponses(value = {
      @ApiResponse(code = HttpStatus.NOT_FOUND_404, message = "microservice not found",
          response = String.class),
      @ApiResponse(code = HttpStatus.UNSUPPORTED_MEDIA_TYPE_415,
          message = "Unprocessable MicroServiceInfo Entity ", response = String.class),
      @ApiResponse(code = HttpStatus.INTERNAL_SERVER_ERROR_500, message = "server internal error",
          response = String.class)})
  @Timed
  public Response getExtActivities(@ApiParam(value = "sence") @QueryParam("sence") String sence) {

    try {
      String json = FileCommonUtils.readString(EXT_ACTIVITIES_FILE_NAME);
      
      Gson gson = new Gson();
      ExtendActivity[] extActivities = gson.fromJson(json, ExtendActivity[].class);
      return Response.status(Response.Status.OK).entity(extActivities).build();
    } catch (IOException e) {
      LOGGER.error("getServiceTemplateById failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    }

  }

  @Path("/displayInfo")
  @GET
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @ApiOperation(value = "Get Model", response = String.class)
  @ApiResponses(value = {
      @ApiResponse(code = HttpStatus.NOT_FOUND_404, message = "microservice not found",
          response = String.class),
      @ApiResponse(code = HttpStatus.UNSUPPORTED_MEDIA_TYPE_415,
          message = "Unprocessable MicroServiceInfo Entity ", response = String.class),
      @ApiResponse(code = HttpStatus.INTERNAL_SERVER_ERROR_500, message = "server internal error",
          response = String.class)})
  @Timed
  public Response getDisplayInfo(@ApiParam(value = "sence") @QueryParam("sence") String sence) {
    String filePath = "ext-activities-display-info.json";
    try {
      String json = FileCommonUtils.readString(filePath);
      return Response.status(Response.Status.OK).entity(json).build();
    } catch (IOException e) {
      LOGGER.error("getServiceTemplateById failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    }
  }

}
