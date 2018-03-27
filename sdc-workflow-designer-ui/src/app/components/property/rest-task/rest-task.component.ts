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
import { TranslateService } from '@ngx-translate/core';

import { PlanTreeviewItem } from '../../../model/plan-treeview-item';
import { ValueSource } from '../../../model/value-source.enum';
import { ValueType } from '../../../model/value-type.enum';
import { RestParameter } from '../../../model/workflow/rest-parameter';
import { RestTask } from '../../../model/workflow/rest-task';
import { BroadcastService } from '../../../services/broadcast.service';
import { NoticeService } from '../../../services/notice.service';
import { RestService } from '../../../services/rest.service';
import { WorkflowUtil } from '../../../util/workflow-util';
import { NodeTypeService } from '../../../services/node-type.service';
import { NodeDataType } from '../../../model/node-data-type/node-data-type';
import { SwaggerBaseParameter } from "../../../model/workflow/swagger/swagger-base-parameter";
import { SwaggerResponse } from "../../../model/workflow/swagger/swagger-response";
import { Swagger, SwaggerMethod } from '../../../model/swagger';
import { SwaggerBodyParameter } from '../../../model/workflow/swagger/swagger-body-parameter';
import { SwaggerNormalParameter } from '../../../model/workflow/swagger/swagger-normal-parameter';
import { SwaggerSchema } from '../../../model/workflow/swagger/swagger-schema';
import { SwaggerIn } from '../../../model/workflow/swagger/swagger-in.enum';

@Component({
    selector: 'wfm-rest-task',
    templateUrl: 'rest-task.component.html',
})
export class RestTaskComponent implements OnInit {
    @Input() public node: RestTask;
    @Input() public planItems: PlanTreeviewItem[];

    public swaggerJson: any = {};
    public restInterfaces = [];
    public restOperations = [];
    public loadSwaggerByMSB = true;
    // public dataTypeInput: SwaggerBaseParameter[] = [];
    public dataTypeOutput: SwaggerResponse[] = [];
    public definitions: SwaggerSchema;
    private swagger: Swagger;

    constructor(private nodeTypeService: NodeTypeService, private broadcastService: BroadcastService, public restService: RestService,
        private noticeService: NoticeService, private translate: TranslateService) { }

    public ngOnInit() {
        const nodeDataType = this.nodeTypeService.getNodeDataTypeById(this.node.typeId);
        // if (nodeDataType.content && nodeDataType.content.baseUrl && nodeDataType.content.serviceName && nodeDataType.content.version
        //     && nodeDataType.content.path && nodeDataType.content.method && nodeDataType.content.consumes) {
        if (nodeDataType && nodeDataType.content && nodeDataType.content.baseUrl && nodeDataType.content.serviceName
            && nodeDataType.content.serviceVersion && nodeDataType.content.path && nodeDataType.content.method) {
            this.loadSwaggerByMSB = false;
        }
        if (this.loadSwaggerByMSB) {
            this.loadInterfaces();
        } else {
            this.setParametersByDataType(nodeDataType);
        }
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

    private loadInterfaces(): void {
        if (this.node.restConfigId) {
            // this.swagger = this.restService.getSwaggerInfo(this.node.restConfigId);
            let restConfig = this.restService.getRestConfig(this.node.restConfigId);
            this.node.baseUrl = restConfig.url;
            this.node.serviceName = restConfig.name;
            this.node.serviceVersion = restConfig.version;

            this.swagger = restConfig.swagger;
            if (this.swagger) {
                this.restInterfaces = [];
                for (const key of Object.keys(this.swagger.paths)) {
                    this.restInterfaces.push(key);
                }
                this.loadOperations();
            } else {
                this.translate.get('WORKFLOW.MSG.SWAGGER_NOT_EXISTS').subscribe((res: string) => {
                    this.noticeService.error(res);
                });
            }
        }
    }

    private loadOperations(): void {
        if (this.node.path) {
            const swaggerPath: any = this.swagger.paths[this.node.path];

            this.restOperations = [];
            for (const key of Object.keys(swaggerPath)) {
                this.restOperations.push(key);
            }
        }
    }

    private updateMethodInfo(): void {
        if (this.node.method) {
            const path: any = this.swagger.paths[this.node.path];
            const method: SwaggerMethod = path[this.node.method];

            this.node.consumes = WorkflowUtil.deepClone(method.consumes);
            this.node.produces = WorkflowUtil.deepClone(method.produces);

            let tempParameters: RestParameter[] = [];
            method.parameters.forEach(param => {
                let defaultType = SwaggerIn[SwaggerIn.body] === param.position ? ValueType[ValueType.object] : ValueType[ValueType.string];
                const type = param.type ? param.type : defaultType;
                const nodeParam = new RestParameter(param.name, undefined, ValueSource[ValueSource.string],
                    type, param.position, param.schema, param.required);
                tempParameters.push(WorkflowUtil.deepClone(nodeParam));
            });
            this.node.parameters = tempParameters;

            const responseParams = this.restService.getResponseParameters(
                this.swagger, this.node.path, this.node.method);
            this.node.responses = responseParams.map(param => WorkflowUtil.deepClone(param));
        }
    }

    private setParametersByDataType(nodeDataType: NodeDataType): void {
        this.node.serviceName = nodeDataType.content.serviceName;
        this.node.serviceVersion = nodeDataType.content.serviceVersion;
        this.node.restConfigId = this.node.serviceName;
        if (this.node.serviceVersion) {
            this.node.restConfigId += ('.' + this.node.serviceVersion);
        }
        this.node.baseUrl = nodeDataType.content.baseUrl;
        this.node.path = nodeDataType.content.path;
        this.node.method = nodeDataType.content.method;
        this.node.consumes = nodeDataType.content.consumes;
        this.node.produces = nodeDataType.content.produces;
        this.definitions = nodeDataType.definitions;
        if (nodeDataType.content.inputs) {
            for (const key in nodeDataType.content.inputs) {
                if (nodeDataType.content.inputs.hasOwnProperty(key)) {
                    // Set default value of dataType
                    const element = nodeDataType.content.inputs[key];
                    let param: SwaggerBaseParameter = this.getParameterByDataType(element, key);
                    if (param) {
                        // Set exist value
                        let found = false;
                        if (this.node.parameters) {
                            for (let p = 0; p < this.node.parameters.length; p++) {
                                if (param.name === this.node.parameters[p].name) {
                                    found = true;
                                    let value = this.node.parameters[p].value;
                                    let valueSource = this.node.parameters[p].valueSource;
                                    param.value = value;
                                    param.valueSource = valueSource;
                                    this.node.parameters[p] = param;
                                    break;
                                }
                            }
                        } else {
                            this.node.parameters = [];
                        }
                        if (!found) {
                            this.node.parameters.push(param);
                        }
                    }
                }
            }
        }
        if (nodeDataType.content.outputs) {
            for (const key in nodeDataType.content.outputs) {
                if (nodeDataType.content.outputs.hasOwnProperty(key)) {
                    // Set default value of dataType
                    const element = nodeDataType.content.outputs[key];
                    this.dataTypeOutput.push(this.getResponseByDataType(element, key));
                }
            }
        }
    }

    private getParameterByDataType(dataTypeParameter: SwaggerBaseParameter, name: string): SwaggerBaseParameter {
        if (!dataTypeParameter.name) {
            dataTypeParameter.name = name;
        }
        if (SwaggerIn[SwaggerIn.body] === dataTypeParameter.in) {
            return this.initBodyParam(dataTypeParameter as SwaggerBodyParameter);
        } else {
            return this.initNormalParam(dataTypeParameter as SwaggerNormalParameter);
        }
    }

    private getResponseByDataType(dataTypeResponse: SwaggerResponse, name: string): SwaggerResponse {
        let responseParam = dataTypeResponse;
        if (!responseParam.name) {
            responseParam.name = name;
        }
        return this.initResponseParam(responseParam);
    }

    private initNormalParam(normalParam: SwaggerNormalParameter): SwaggerNormalParameter {
        let normal = WorkflowUtil.deepClone(normalParam);
        // Set default value of dataType
        if (undefined === normalParam.show) {
            normal.show = true;
        }
        if ('path' === normalParam.in) {
            normal.required = true;
        } else if (undefined === normalParam.required) {
            normal.required = false;
        }
        if (undefined === normalParam.allowEmptyValue) {
            normal.allowEmptyValue = false;
        }
        if (undefined === normalParam.collectionFormat) {
            normal.collectionFormat = 'csv';
        }
        if (undefined === normalParam.type) {
            normal.type == ValueType[ValueType.string];
        }
        // editable not support
        return normal;
    }

    private initBodyParam(bodyParam: SwaggerBodyParameter): SwaggerBodyParameter {
        let body = WorkflowUtil.deepClone(bodyParam);
        // Set default value of dataType
        if (undefined === bodyParam.show) {
            body.show = true;
        }
        if (undefined === bodyParam.required) {
            body.required = false;
        }
        if (undefined === bodyParam.valueSource) {
            body.valueSource = ValueSource[ValueSource.Definition];
        }
        if (undefined === bodyParam.schema.type) {
            body.schema.type == ValueType[ValueType.string];
        }
        // $ref not support
        if (bodyParam.$ref) {
            console.warn('Do not support body parameter $ref.');
        }
        return body;
    }

    private initResponseParam(responseParam: SwaggerResponse): SwaggerResponse {
        let response = responseParam;
        return response;
    }
}
