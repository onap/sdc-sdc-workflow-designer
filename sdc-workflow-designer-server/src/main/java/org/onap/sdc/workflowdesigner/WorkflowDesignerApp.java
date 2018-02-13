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

package org.onap.sdc.workflowdesigner;

import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.onap.sdc.workflowdesigner.resources.ExtendActivityResource;
import org.onap.sdc.workflowdesigner.resources.WorkflowModelerResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonInclude;

import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.server.SimpleServerFactory;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.swagger.jaxrs.config.BeanConfig;
import io.swagger.jaxrs.listing.ApiListingResource;

public class WorkflowDesignerApp extends Application<WorkflowDesignerConfiguration> {

  private static final Logger LOGGER = LoggerFactory.getLogger(WorkflowDesignerApp.class);

  public static void main(String[] args) throws Exception {
    new WorkflowDesignerApp().run(args);
  }

  @Override
  public String getName() {
    return "Workflow Designer";
  }

  @Override
  public void initialize(Bootstrap<WorkflowDesignerConfiguration> bootstrap) {
    bootstrap.addBundle(new AssetsBundle("/api-doc", "/api-doc", "index.html", "api-doc"));
    bootstrap.addBundle(new AssetsBundle("/workflow-modeler", "/workflow-modeler", "index.html",
        "workflow-modeler"));
    bootstrap.addBundle(new AssetsBundle("/workflow-modeler", "/", "index.html", "ng"));
  }

  @Override
  public void run(WorkflowDesignerConfiguration configuration, Environment environment) {
    LOGGER.info("Start to initialize Workflow Designer.");

    environment.jersey().register(new WorkflowModelerResource());
    environment.jersey().register(new ExtendActivityResource());

    // register rest interface
    environment.jersey().packages("org.onap.sdc.workflowdesigner.resources");
    // upload file by inputstream need to register MultiPartFeature
    environment.jersey().register(MultiPartFeature.class);

    initSwaggerConfig(environment, configuration);

    LOGGER.info("Initialize catalogue finished.");
  }

  /**
   * initialize swagger configuration.
   * 
   * @param environment environment information
   * @param configuration catalogue configuration
   */
  private void initSwaggerConfig(Environment environment,
      WorkflowDesignerConfiguration configuration) {
    environment.jersey().register(new ApiListingResource());
    environment.getObjectMapper().setSerializationInclusion(JsonInclude.Include.NON_NULL);

    BeanConfig config = new BeanConfig();
    config.setTitle("Workflow Designer rest API");
    config.setVersion("1.0.0");
    config.setResourcePackage("org.onap.sdc.workflowdesigner.resources");

    // set rest api basepath in swagger
    SimpleServerFactory simpleServerFactory =
        (SimpleServerFactory) configuration.getServerFactory();
    String basePath = simpleServerFactory.getApplicationContextPath();
    String rootPath = simpleServerFactory.getJerseyRootPath().get();
    rootPath = rootPath.substring(0, rootPath.indexOf("/*"));
    basePath = basePath.equals("/") ? rootPath
        : (new StringBuilder()).append(basePath).append(rootPath).toString();
    config.setBasePath(basePath);
    config.setScan(true);
  }

}
