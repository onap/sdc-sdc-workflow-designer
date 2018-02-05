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
import org.onap.sdc.workflowdesigner.utils.FileCommonUtils;
import org.onap.sdc.workflowdesigner.utils.RestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codahale.metrics.annotation.Timed;

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
  private static final Logger logger = LoggerFactory.getLogger(ExtendActivityResource.class);

  /**
   * test function.
   * 
   * @return Response
   */
  @Path("/")
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
  public Response getExtActivities(@ApiParam(value = "sence") @QueryParam("sence") String sence) {
    String filePath = "ext-activities.json";
    try {
      String json = FileCommonUtils.readString(filePath);
      return Response.status(Response.Status.OK).entity(json).build();
    } catch (IOException e) {
      logger.error("getServiceTemplateById failed.", e);
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
      logger.error("getServiceTemplateById failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    }
  }

}
