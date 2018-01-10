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
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { PlanTreeviewItem } from '../../../model/plan-treeview-item';
import { Swagger, SwaggerMethod, SwaggerParameter, SwaggerResponse } from '../../../model/swagger';
import { ValueSource } from '../../../model/value-source.enum';
import { ValueType } from '../../../model/value-type.enum';
import { RestParameter } from '../../../model/workflow/rest-parameter';
import { RestTask } from '../../../model/workflow/rest-task';
import { BroadcastService } from '../../../services/broadcast.service';
import { RestService } from '../../../services/rest.service';
import { WorkflowUtil } from '../../../util/workflow-util';

@Component({
    selector: 'b4t-rest-task',
    templateUrl: 'rest-task.component.html',
})
export class RestTaskComponent implements OnInit {
    @Input() public node: RestTask;
    @Input() public planItems: PlanTreeviewItem[];
    public swaggerJson: any = {};
    public restInterfaces: any[];
    public restOperations: any = [];
    private swagger: Swagger;

    constructor(private broadcastService: BroadcastService, public restService: RestService) { }

    public ngOnInit() {
        this.loadInterfaces();
    }

    public serviceChanged(configId: string) {
        this.node.restConfigId = configId;
        this.pathChanged('');
        this.loadInterfaces();
    }

    public pathChanged(path: string) {
        this.node.path = path;
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
        if (this.node.restConfigId) {
            this.swagger = this.restService.getSwaggerInfo(this.node.restConfigId);

            if (this.swagger) {
                this.restInterfaces = [];
                for (const key of Object.keys(this.swagger.paths)) {
                    this.restInterfaces.push(key);
                }
                this.loadOperations();
            }
        }
    }

    private loadOperations() {
        if (this.node.path) {
            const swaggerPath: any = this.swagger.paths[this.node.path];

            this.restOperations = [];
            for (const key of Object.keys(swaggerPath)) {
                this.restOperations.push(key);
            }
        }
    }

    private updateMethodInfo() {
        if (this.node.method) {
            const path: any = this.swagger.paths[this.node.path];
            const method: SwaggerMethod = path[this.node.method];

            this.node.consumes = WorkflowUtil.deepClone(method.consumes);
            this.node.produces = WorkflowUtil.deepClone(method.produces);

            let tempParameters: RestParameter[] = [];
            method.parameters.forEach(param => {
                const nodeParam = new RestParameter(param.name, '', ValueSource[ValueSource.String],
                    ValueType[ValueType.String], param.position, param.schema, param.required);
                tempParameters.push(WorkflowUtil.deepClone(nodeParam));
            });
            this.node.parameters = tempParameters;

            const responseParams = this.restService.getResponseParameters(
                this.swagger, this.node.path, this.node.method);
            this.node.responses = responseParams.map(param => WorkflowUtil.deepClone(param));
        }
    }
}
