/**
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */

import { Injectable } from '@angular/core';
import { WorkflowService } from "./workflow.service";
import { Microservice } from "../model/workflow/microservice";
import { Observable } from "rxjs/Rx";
import { HttpService } from "../util/http.service";
import { Swagger, SwaggerSchemaObject } from "../model/swagger";

/**
 * WorkflowConfigService
 * provides all of the operations about workflow configs.
 */
@Injectable()
export class WorkflowConfigService {
    constructor(private httpService: HttpService, private workflowService: WorkflowService) {}

    public getMicroservices(): Microservice[] {
        return this.workflowService.workflow.configs.microservices;
    }

    public loadDynamicInfo(url: string): Observable<any> {
        const options: any = {
            headers: {
                Accept: 'application/json',
            },
        };
        return this.httpService.get(url).map(response => response.data);
    }

    public getSwaggerInfo(serviceName: string, version: string): Swagger {
        const microservice = this.getMicroservices().find(service => (service.name === serviceName && service.version === version));
        if(microservice) {
            return microservice.swagger;
        } else {
            return undefined;
        }
    }

    public getDefinition(swagger: Swagger, position: string): SwaggerSchemaObject {
        const definitionName = position.substring('#/definitions/'.length);

        return swagger.definitions[definitionName];
    }

}
