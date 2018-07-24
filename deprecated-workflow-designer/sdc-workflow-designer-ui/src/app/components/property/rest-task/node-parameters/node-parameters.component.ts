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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { PlanTreeviewItem } from '../../../../model/plan-treeview-item';
import { Swagger, SwaggerResponseClass } from '../../../../model/swagger';
import { ValueSource } from '../../../../model/value-source.enum';
import { RestParameter } from '../../../../model/workflow/rest-parameter';
import { BroadcastService } from '../../../../services/broadcast.service';
import { SwaggerTreeConverterService } from '../../../../services/swagger-tree-converter.service';
import { RestService } from "../../../../services/rest.service";
import { SwaggerIn } from '../../../../model/workflow/swagger/swagger-in.enum';

/**
 * property component presents information of a workflow node.
 * the presented information can be edit in this component.
 * it may load information dynamically. the content may be different for different node type.
 */
@Component({
    selector: 'wfm-node-parameters',
    styleUrls: ['./node-parameters.component.css'],
    templateUrl: 'node-parameters.component.html',
})
export class NodeParametersComponent implements OnChanges {
    @Input() public swaggerInput: RestParameter[];
    @Input() public swaggerOutput: SwaggerResponseClass[];
    @Input() public restConfigId: string;
    @Input() public planItems: PlanTreeviewItem[];

    public inputSources: ValueSource[] = [ValueSource.Variable, ValueSource.Topology, ValueSource.Plan];
    public outputSources: ValueSource[] = [];
    public valueSource = ValueSource;
    public headerParams: RestParameter[] = [];
    public pathParams: RestParameter[] = [];
    public queryParams: RestParameter[] = [];
    public inputParams: TreeNode[] = [];
    public outputParams: TreeNode[] = [];

    private index = 1;

    constructor(private broadcastService: BroadcastService,
        private restService: RestService,
        private swaggerTreeConverterService: SwaggerTreeConverterService) {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.swaggerInput && changes.swaggerInput.currentValue) {
            this.resetRequestParams(changes.swaggerInput.currentValue);
        }
        if (changes.swaggerOutput && changes.swaggerOutput.currentValue) {
            this.resetResponseParams(changes.swaggerOutput.currentValue);
        }
    }

    public resetRequestParams(parameters: RestParameter[]) {
        this.pathParams = [];
        this.queryParams = [];
        this.inputParams = [];
        this.headerParams = [];

        parameters.forEach(param => {
            if (SwaggerIn[SwaggerIn.path] === param.position) {
                this.pathParams.push(param);
            } else if (SwaggerIn[SwaggerIn.query] === param.position) {
                this.queryParams.push(param);
            } else if (SwaggerIn[SwaggerIn.header] === param.position) {
                this.headerParams.push(param);
            } else if (SwaggerIn[SwaggerIn.body] === param.position) {
                let valueObject = undefined;
                if (undefined !== param.value || undefined !== param.valueSource) {
                    valueObject = { value: param.value, valueSource: param.valueSource };
                }
                const requestTreeNode = this.swaggerTreeConverterService.schema2TreeNode(this.restService.getSwaggerInfo(this.restConfigId),
                    'Request Param', param.schema, valueObject);
                // console.log('requestTreeNode is :');
                // console.log(requestTreeNode.value);
                param.value = requestTreeNode.value.value;
                param.valueSource = requestTreeNode.value.valueSource;
                this.inputParams.push(requestTreeNode);
            } else {
                // TODO others param types not supported
                console.log('Unsupport parameter position(in):' + param.position);
            }
        });
    }

    public resetResponseParams(responses: SwaggerResponseClass[]) {
        this.outputParams = [];
        if (0 < responses.length && responses[0].schema) {
            const treeNode = this.swaggerTreeConverterService.schema2TreeNode(
                this.restService.getSwaggerInfo(this.restConfigId),
                'Response Params',
                responses[0].schema,
                { value: {}, valueSource: ValueSource[ValueSource.Definition] });
            this.outputParams.push(treeNode);
        }
    }
}
