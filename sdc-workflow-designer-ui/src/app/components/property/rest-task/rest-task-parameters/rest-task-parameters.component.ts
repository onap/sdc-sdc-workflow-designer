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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { Swagger } from '../../../../model/swagger';
import { RestTask } from '../../../../model/workflow/rest-task';
import { BroadcastService } from '../../../../services/broadcast.service';
import { RestParameter } from "../../../../model/workflow/rest-parameter";
import { ValueSource } from "../../../../model/value-source.enum";
import { SwaggerTreeConverterService } from "../../../../services/swagger-tree-converter.service";
import { PlanTreeviewItem } from "../../../../model/plan-treeview-item";
import { WorkflowConfigService } from "../../../../services/workflow-config.service";

/**
 * property component presents information of a workflow node.
 * the presented information can be edit in this component.
 * it may load information dynamically. the content may be different for different node type.
 */
@Component({
    selector: 'b4t-rest-task-parameters',
    templateUrl: 'rest-task-parameters.component.html',
})
export class RestTaskParametersComponent implements OnInit {
    @Input() public task: RestTask;
    @Input() public planItems: PlanTreeviewItem[];

    public inputSources: ValueSource[] = [ValueSource.String, ValueSource.Variable, ValueSource.Plan];
    public requestParameters: RestParameter[] = []; // not include body parameter
    public bodyParameter: TreeNode[] = [];
    public responseParameter: TreeNode[] = [];
    public valueSource = ValueSource;

    private index = 1;

    constructor(private broadcastService: BroadcastService,
        private workflowConfigService: WorkflowConfigService,
        private swaggerTreeConverterService: SwaggerTreeConverterService) {
    }

    public ngOnInit() {
        this.broadcastService.nodeTaskChange$.subscribe(() => {
            this.resetRequestParams();
            this.resetResponseParams();
        });
    }

    public resetRequestParams() {
        this.requestParameters = [];
        this.bodyParameter = [];

        this.task.parameters.forEach(param => {
            if (param.position === 'body') {
                const requestTreeNode = this.swaggerTreeConverterService
                    .schema2TreeNode(this.workflowConfigService.getSwaggerInfo(this.task.serviceName, this.task.serviceVersion), 'Request Param', param.schema, param.value);
                param.value = requestTreeNode.value;
                param.value = param.schema.value;
                this.bodyParameter.push(requestTreeNode);
            } else {
                this.requestParameters.push(param);
            }
        });
    }

    public resetResponseParams() {
        // TODO add response body handler
    }
}
