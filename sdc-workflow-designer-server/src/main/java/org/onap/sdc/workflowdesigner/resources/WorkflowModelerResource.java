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
import java.net.URI;
import java.nio.file.Paths;
import java.util.UUID;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.jetty.http.HttpStatus;
import org.onap.sdc.workflowdesigner.model.Process;
import org.onap.sdc.workflowdesigner.parser.Bpmn4ToscaJsonParser;
import org.onap.sdc.workflowdesigner.utils.FileCommonUtils;
import org.onap.sdc.workflowdesigner.utils.RestUtils;
import org.onap.sdc.workflowdesigner.writer.BpmnPlanArtefactWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codahale.metrics.annotation.Timed;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

/**
 * Workflow Modeler Resource.
 * 
 */
@Path("/models")
@Api(tags = {"Workflow Modeler"})
public class WorkflowModelerResource {
  private static final Logger logger = LoggerFactory.getLogger(WorkflowModelerResource.class);
  
  private static final String WORKFLOW_JSON_TEMP_FILE_NAME = "temp_workflow.json";
  private static final String WORKFLOW_XML_TEMP_FILE_NAME = "temp_workflow.xml";


  /**
   * 
   * @return Response
   */
  @Path("/{id}")
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
  public Response getModel(@ApiParam(value = "id") @PathParam("id") String id) {
    String filePath = "model.json";
    try {
      String json = FileCommonUtils.readString(filePath);
      return Response.status(Response.Status.OK).entity(json).build();
    } catch (IOException e) {
      logger.error("get workflow failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    }
  }

  
  
  @Path("/{id}")
  @PUT
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @ApiOperation(value = "Save Model", response = String.class)
  @ApiResponses(value = {
      @ApiResponse(code = HttpStatus.NOT_FOUND_404, message = "microservice not found",
          response = String.class),
      @ApiResponse(code = HttpStatus.UNSUPPORTED_MEDIA_TYPE_415,
          message = "Unprocessable MicroServiceInfo Entity ", response = String.class),
      @ApiResponse(code = HttpStatus.INTERNAL_SERVER_ERROR_500, message = "server internal error",
          response = String.class)})
  @Timed
  public Response saveModel(@ApiParam(value = "id") @PathParam("id") String id,
      @ApiParam(value = "Model Content", required = true) String json) {
    try {
      FileCommonUtils.write(WORKFLOW_JSON_TEMP_FILE_NAME, json);

      URI srcUri = Paths.get(".", WORKFLOW_JSON_TEMP_FILE_NAME).toUri();
      String processName = "plan_" + UUID.randomUUID().toString();
      Bpmn4ToscaJsonParser parser = new Bpmn4ToscaJsonParser();
      Process process = parser.parse(processName, srcUri);
      
      // transform bpmn template
      BpmnPlanArtefactWriter writer = new BpmnPlanArtefactWriter(process);
      String bpmn = writer.completePlanTemplate();
      
      FileCommonUtils.write(WORKFLOW_XML_TEMP_FILE_NAME, bpmn);
      
      return Response.status(Response.Status.OK).entity(json).build();
    } catch (IOException e) {
      logger.error("save workflow failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    } catch (Exception e) {
      logger.error("convert workflow from json to bpmn failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    }
  }

}
