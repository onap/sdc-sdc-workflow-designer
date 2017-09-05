/*******************************************************************************
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 *******************************************************************************/
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Swagger, SwaggerMethod, SwaggerParameter, SwaggerResponse } from '../../../model/swagger';
import { ValueSource } from '../../../model/value-source.enum';
import { ValueType } from '../../../model/value-type.enum';
import { RestTask } from '../../../model/workflow/rest-task';
import { BroadcastService } from '../../../services/broadcast.service';
import { WorkflowConfigService } from '../../../services/workflow-config.service';
import { Microservice } from "../../../model/workflow/microservice";
import { WorkflowUtil } from "../../../util/workflow-util";
import { RestParameter } from "../../../model/workflow/rest-parameter";

@Component({
    selector: 'b4t-rest-task',
    templateUrl: 'rest-task.component.html',
})
export class RestTaskComponent implements AfterViewInit, OnInit {
    @Input() public node: RestTask;
    public swaggerJson: any = {};
    public restInterfaces: any[];
    public restOperations: any = [];
    public microservices: Microservice[];
    public selectedMicroservice: Microservice;
    private swagger: Swagger;

    constructor(private broadcastService: BroadcastService,
        private configService: WorkflowConfigService) { }

    ngOnInit(): void {
        this.microservices = this.configService.getMicroservices();
        this.selectedMicroservice = this.microservices.find(service =>
            (this.node.serviceName === service.name && this.node.serviceVersion === service.version));
    }
    public ngAfterViewInit() {
        setTimeout(() => {
            this.loadInterfaces();
        }, 0);
    }

    public getText4Microservice(microservice: Microservice): string {
        return `${microservice.name} [${microservice.version}] `;
    }

    public serviceChanged(service: Microservice) {
        this.selectedMicroservice = service;
        this.node.serviceName = service.name;
        this.node.serviceVersion = service.version;
        this.urlChanged('');
        this.loadInterfaces();
    }

    public urlChanged(url: string) {
        this.node.url = url;

        this.node.consumes = [];
        this.node.produces = [];
        this.methodChanged('');

        this.loadOperations();
    }

    public methodChanged(method: string) {
        this.node.method = method;

        this.node.parameters = [];
        this.node.responses = [];

        this.updateMethodInfo();
    }


    private loadInterfaces() {
        if (this.node.serviceName && this.node.serviceVersion) {
            this.swagger = this.configService.getSwaggerInfo(this.node.serviceName, this.node.serviceVersion);

            if (this.swagger) {
                this.restInterfaces = [];
                for (const key of Object.keys(this.swagger.paths)) {
                    this.restInterfaces.push(key);
                }
                this.loadOperations();
            } else {
                // TODO error handler
            }
        }
    }

    private loadOperations() {
        if (this.node.url) {
            const swaggerPath: any = this.swagger.paths[this.node.url];

            this.restOperations = [];
            for (const key of Object.keys(swaggerPath)) {
                this.restOperations.push(key);
            }
        }
    }

    private updateMethodInfo() {
        if (this.node.method) {
            const path: any = this.swagger.paths[this.node.url];
            const method: SwaggerMethod = path[this.node.method];

            this.node.consumes = WorkflowUtil.deepClone(method.consumes);
            this.node.produces = WorkflowUtil.deepClone(method.produces);

            // request parameters
            method.parameters.forEach(param => {
                const nodeParam = new RestParameter(param.name, '', ValueSource[ValueSource.String],
                    param.type, param.position, param.schema);
                this.node.parameters.push(nodeParam);
            });

            // response parameters
            const responseParams = this.getResponseParameters(method.responses);
            this.node.responses = responseParams.map(param => WorkflowUtil.deepClone(param));
        }
    }

    private getResponseParameters(responses: any) {
        let response: SwaggerResponse = null;

        for (const key of Object.keys(responses)) {
            if (key.startsWith('20')) {
                response = responses[key];
            }
        }

        return [response];
    }
}
