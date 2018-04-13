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
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.jetty.http.HttpStatus;
import org.onap.sdc.workflowdesigner.common.SDCProxyException;
import org.onap.sdc.workflowdesigner.config.AppConfig;
import org.onap.sdc.workflowdesigner.externalservice.sdc.ActivitySpecServiceProxy;
import org.onap.sdc.workflowdesigner.externalservice.sdc.entity.ActivitySpec;
import org.onap.sdc.workflowdesigner.externalservice.sdc.entity.Parameter;
import org.onap.sdc.workflowdesigner.resources.entity.ExtActivityDisplayInfo;
import org.onap.sdc.workflowdesigner.resources.entity.I18nString;
import org.onap.sdc.workflowdesigner.resources.entity.InputOutput;
import org.onap.sdc.workflowdesigner.resources.entity.NodeCategory;
import org.onap.sdc.workflowdesigner.resources.entity.CategoryData;
import org.onap.sdc.workflowdesigner.resources.entity.Content;
import org.onap.sdc.workflowdesigner.resources.entity.ExtActivity;
import org.onap.sdc.workflowdesigner.utils.FileCommonUtils;
import org.onap.sdc.workflowdesigner.utils.JsonUtils;
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
  private static final Logger LOGGER = LoggerFactory.getLogger(ExtendActivityResource.class);

  /** */
  private static final String EXT_ACTIVITIES_DISPLAY_INFO_FILE_NAME =
      "ext-activities-display-info.json";

  private static final String EXT_ACTIVITIES_FILE_NAME = "ext-activities.json";

  private static final CategoryData EXTENSION_TASK_CATEGORY =
      new CategoryData(new I18nString("Extension Task", "Extension Task"));

  private static final String EXTENSION_TASK_CATEGORY_CATEGORY_ID = "extension_task_category_id";

  /**
   * test function.
   * 
   * @return Response
   */
  @Path("/")
  @GET
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @ApiOperation(value = "Get Extend Activities.", response = ExtActivity.class,
      responseContainer = "List")
  @ApiResponses(value = {
      @ApiResponse(code = HttpStatus.NOT_FOUND_404, message = "microservice not found",
          response = String.class),
      @ApiResponse(code = HttpStatus.UNSUPPORTED_MEDIA_TYPE_415,
          message = "Unprocessable MicroServiceInfo Entity ", response = String.class),
      @ApiResponse(code = HttpStatus.INTERNAL_SERVER_ERROR_500, message = "server internal error",
          response = String.class)})
  @Timed
  public Response getExtActivities(@ApiParam(value = "sence") @QueryParam("sence") String sence) {
    if (AppConfig.isSDCAdapter()) {
      return getExtActivitiesfromSDC();
    } else {
      return getExtActivitiesfromLocal();
    }
  }

  /**
   * @return
   */
  private Response getExtActivitiesfromLocal() {
    try {
      String json = FileCommonUtils.readString(EXT_ACTIVITIES_FILE_NAME);
      ExtActivity[] extActivities = JsonUtils.fromJson(json, ExtActivity[].class);
      return Response.status(Response.Status.OK).entity(extActivities).build();
    } catch (IOException e) {
      LOGGER.error("Get ExtActivities from local failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    }
  }

  /**
   * @return
   */
  private Response getExtActivitiesfromSDC() {
    try {
      ActivitySpecServiceProxy proxy = new ActivitySpecServiceProxy();
      ActivitySpec[] activitySpecs = proxy.getActivitySpecs();
      ExtActivity[] extActivities = convert2ExtActivities(activitySpecs);
      return Response.status(Response.Status.OK).entity(extActivities).build();
    } catch (SDCProxyException e) {
      LOGGER.error("Get ExtActivities from sdc failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    }
  }

  /**
   * @param activitySpecs
   * @return
   */
  private ExtActivity[] convert2ExtActivities(ActivitySpec[] activitySpecs) {
    ExtActivity[] extendActivities = new ExtActivity[activitySpecs.length];
    for (int i = 0; i < activitySpecs.length; i++) {
      extendActivities[i] = convert2ExtActivity(activitySpecs[i]);
    }
    return extendActivities;
  }

  /**
   * @param activitySpec
   * @return
   */
  private ExtActivity convert2ExtActivity(ActivitySpec activitySpec) {
    ExtActivity extActivity = new ExtActivity();
    extActivity.setId(activitySpec.getId());
    extActivity.setDisplayName(new I18nString(activitySpec.getName(), activitySpec.getName()));
    extActivity.setDescription(
        new I18nString(activitySpec.getDescription(), activitySpec.getDescription()));
    extActivity.setType(activitySpec.getType());
    extActivity.setContent(buildContent(activitySpec));
    return extActivity;
  }

  /**
   * @param activitySpec
   * @return
   */
  private Content buildContent(ActivitySpec activitySpec) {
    Content content = new Content();
//    content.setClass(activitySpec.getContent().getClazz());
    content.clazz = activitySpec.getContent().clazz;
    content.setScript(activitySpec.getContent().getScript());
    content.setScriptFormat(activitySpec.getContent().getScriptFormat());
    content.setInputs(convert2InputOutputs(activitySpec.getInputs()));
    content.setOutputs(convert2InputOutputs(activitySpec.getOutputs()));
    return content;
  }

  /**
   * @param parameters
   * @return
   */
  private Map<String, InputOutput> convert2InputOutputs(Parameter[] parameters) {
    Map<String, InputOutput> inputOutputs = new HashMap<>();
    for (Parameter parameter : parameters) {
      inputOutputs.put(parameter.getName(), convert2InputOutput(parameter));
    }
    return inputOutputs;
  }

  /**
   * @param parameter
   * @return
   */
  private InputOutput convert2InputOutput(Parameter parameter) {
    InputOutput inputOutput = new InputOutput();
    inputOutput.setDisplayName(new I18nString(parameter.getName(), parameter.getName()));
    inputOutput.setType(parameter.getType());
    inputOutput.setDefault(parameter.getDefault());
    inputOutput.setValue(parameter.getValue());
    return inputOutput;
  }


  @Path("/displayInfo")
  @GET
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  @ApiOperation(value = "Get Extend Activities DisplayInfo",
      response = ExtActivityDisplayInfo.class)
  @ApiResponses(value = {
      @ApiResponse(code = HttpStatus.NOT_FOUND_404, message = "microservice not found",
          response = String.class),
      @ApiResponse(code = HttpStatus.UNSUPPORTED_MEDIA_TYPE_415,
          message = "Unprocessable MicroServiceInfo Entity ", response = String.class),
      @ApiResponse(code = HttpStatus.INTERNAL_SERVER_ERROR_500, message = "server internal error",
          response = String.class)})
  @Timed
  public Response getDisplayInfo(@ApiParam(value = "sence") @QueryParam("sence") String sence) {
    if (AppConfig.isSDCAdapter()) {
      return getDisplayInfofromSDC();
    } else {
      return getDisplayInfofromLocal(sence);
    }
  }

  /**
   * @param sence
   * @return
   */
  private Response getDisplayInfofromLocal(String sence) {
    try {
      ExtActivityDisplayInfo displayInfo = retriveDisplayInfo(sence);
      return Response.status(Response.Status.OK).entity(displayInfo).build();
    } catch (IOException e) {
      LOGGER.error("Get Extend Activities DisplayInfo from failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    }
  }

  /**
   * @return
   */
  private Response getDisplayInfofromSDC() {
    try {
      ActivitySpecServiceProxy proxy = new ActivitySpecServiceProxy();
      ActivitySpec[] activitySpecs = proxy.getActivitySpecs();
      ExtActivityDisplayInfo displayInfo = convert2ExtActivityDisplayInfo(activitySpecs);
      return Response.status(Response.Status.OK).entity(displayInfo).build();
    } catch (SDCProxyException e) {
      LOGGER.error("Get Extend Activities DisplayInfo from sdc failed.", e);
      throw RestUtils.newInternalServerErrorException(e);
    }
  }

  /**
   * @param activitySpecs
   * @return
   */
  private ExtActivityDisplayInfo convert2ExtActivityDisplayInfo(ActivitySpec[] activitySpecs) {
    ExtActivityDisplayInfo displayInfo = new ExtActivityDisplayInfo();

    for (ActivitySpec activitySpec : activitySpecs) {
      displayInfo.getNodes().put(activitySpec.getId(), buildNodeCategory(activitySpec));
    }

    displayInfo.getCategoryData().put(EXTENSION_TASK_CATEGORY_CATEGORY_ID, EXTENSION_TASK_CATEGORY);

    return displayInfo;
  }

  /**
   * @param activitySpec
   * @return
   */
  private NodeCategory buildNodeCategory(ActivitySpec activitySpec) {
    NodeCategory nodeCategory = new NodeCategory();
    nodeCategory.setCategory(EXTENSION_TASK_CATEGORY_CATEGORY_ID);

    return nodeCategory;
  }

  /**
   * @param sence
   * @return
   * @throws IOException
   */
  private ExtActivityDisplayInfo retriveDisplayInfo(String sence) throws IOException {
    String json = FileCommonUtils.readString(EXT_ACTIVITIES_DISPLAY_INFO_FILE_NAME);
    return JsonUtils.fromJson(json, ExtActivityDisplayInfo.class);
  }

}
