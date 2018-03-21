/**
 * Copyright (c) 2017-2018 ZTE Corporation.
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
import java.util.List;
import java.util.UUID;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.dom4j.Comment;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.eclipse.jetty.http.HttpStatus;
import org.onap.sdc.workflowdesigner.common.WorkflowDesignerException;
import org.onap.sdc.workflowdesigner.externalservice.sdc.SDCServiceProxy;
import org.onap.sdc.workflowdesigner.externalservice.sdc.entity.WorkflowArtifactInfo;
import org.onap.sdc.workflowdesigner.model.Process;
import org.onap.sdc.workflowdesigner.parser.Bpmn4ToscaJsonParser;
import org.onap.sdc.workflowdesigner.resources.entity.WorkflowInfo;
import org.onap.sdc.workflowdesigner.utils.FileCommonUtils;
import org.onap.sdc.workflowdesigner.utils.JsonUtils;
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
    try {
      String json = FileCommonUtils.readString(WORKFLOW_JSON_TEMP_FILE_NAME);
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
      String bpmn = buildBPMN(srcUri, processName);
      String jsonBpmn = insertJson2Bpmn(json, bpmn);

      save2SDC(json, jsonBpmn);
      FileCommonUtils.write(WORKFLOW_XML_TEMP_FILE_NAME, jsonBpmn);

      return Response.status(Response.Status.OK).entity(json).build();
    } catch (IOException e) {
      logger.error("save workflow failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    } catch (Exception e) {
      logger.error("convert workflow from json to bpmn failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    }
  }
  
  /**
   * @param json
   * @param bpmn
   * @return
   */
  protected String insertJson2Bpmn(String json, String bpmn) {
    StringBuffer sb = new StringBuffer(bpmn);
    sb.append("<!-- \n").append(json).append("-->\n");

    return sb.toString();
  }
  
  /**
   * 
   * @return
   * @throws DocumentException 
   */
  protected String readJsonfromBPMNFile(String bpmn) throws DocumentException {
    Document doc = DocumentHelper.parseText(bpmn);
    List<?> elementList = doc.content();
    for (Object object : elementList) {
      if (object instanceof Comment) {
        Comment comment = (Comment) object;
        return comment.getText().trim();
      }
    }
    
    return null;
  }


  /**
   * @param json
   * @param bpmn
   * @throws WorkflowDesignerException
   */
  private void save2SDC(String json, String bpmn) throws WorkflowDesignerException {
    WorkflowInfo workflowInfo = JsonUtils.fromJson(json, WorkflowInfo.class);
    WorkflowArtifactInfo workflowArtifactInfo =
        new WorkflowArtifactInfo(workflowInfo.getName(), workflowInfo.getDescription(), bpmn);

    SDCServiceProxy sdcProxy = new SDCServiceProxy();
    sdcProxy.saveWorkflowArtifact(workflowInfo.getUuid(), workflowInfo.getOperationId(),
        workflowInfo.getId(), workflowArtifactInfo);
  }

  /**
   * 
   * @param srcUri
   * @param processName
   * @return
   * @throws IOException
   * @throws Exception
   */
  protected String buildBPMN(URI srcUri, String processName) throws IOException, Exception {
    Bpmn4ToscaJsonParser parser = new Bpmn4ToscaJsonParser();
    Process process = parser.parse(processName, srcUri);

    // transform bpmn template
    BpmnPlanArtefactWriter writer = new BpmnPlanArtefactWriter(process);
    return writer.completePlanTemplate();
  }

}
