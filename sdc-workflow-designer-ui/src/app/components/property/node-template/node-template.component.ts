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
import { AfterViewInit, Component, Input } from '@angular/core';
import { Subscription } from '../../../../../node_modules/rxjs/Subscription.d';

import { PlanTreeviewItem } from '../../../model/plan-treeview-item';
import { NodeTemplate } from '../../../model/topology/node-template';
import { ValueSource } from '../../../model/value-source.enum';
import { Parameter } from '../../../model/workflow/parameter';
import { ToscaNodeTask } from '../../../model/workflow/tosca-node-task';
import { BroadcastService } from '../../../services/broadcast.service';
import { ToscaService } from '../../../services/tosca.service';

/**
 * node template component provides operations about tosca modules which saved in winery.
 * This component will be used in the property component while the corresponding workflow node is calling the node template's operation
 */
@Component({
    selector: 'wfm-node-template',
    templateUrl: 'node-template.component.html',
})
export class NodeTemplateComponent implements AfterViewInit {
    @Input() public node: ToscaNodeTask;
    @Input() public planItems: PlanTreeviewItem[];

    public inputSources: ValueSource[] = [ValueSource.string, ValueSource.Variable, ValueSource.Topology, ValueSource.Plan];
    public outputSources: ValueSource[] = [ValueSource.Topology, ValueSource.Plan];
    public nodeInterfaces: string[] = [];
    public nodeOperations: any[] = [];
    public nodeTemplates: NodeTemplate[] = [];

    constructor(private toscaService: ToscaService) {
    }

    public ngAfterViewInit() {
        this.nodeTemplates = this.toscaService.getNodeTemplate();

        this.loadInterfaces();
        this.loadOperations();
    }

    public nodeTemplateChanged() {
        this.setTemplateNamespace();

        this.nodeInterfaceChanged('');

        this.loadInterfaces();
    }

    public nodeInterfaceChanged(newInterface: string) {
        this.node.nodeInterface = newInterface;

        this.nodeOperationChanged('');

        this.loadOperations();
    }

    public nodeOperationChanged(operation: string) {
        this.node.operation = operation;

        this.node.input = [];
        this.node.output = [];

        this.loadParameters();
    }

    private setTemplateNamespace() {
        const nodeTemplate = this.nodeTemplates.find(
            tmpNodeTemplate => tmpNodeTemplate.id === this.node.template.id);

        if (nodeTemplate) {
            this.node.template.namespace = nodeTemplate.namespace;
            this.node.template.type = nodeTemplate.type;
        }
    }

    private loadInterfaces() {
        if (this.node.template.id) {
            this.toscaService.loadNodeTemplateInterfaces(this.node.template)
                .subscribe(interfaces => {
                    this.nodeInterfaces = interfaces;
                });
        } else {
            this.nodeInterfaces = [];
        }
    }

    private loadOperations() {
        if (this.node.nodeInterface) {
            this.nodeOperations = [];
            this.toscaService.loadNodeTemplateOperations(
                this.node.template,
                this.node.nodeInterface)
                .subscribe(operations => this.nodeOperations = operations);
        } else {
            this.nodeOperations = [];
        }
    }

    private loadParameters() {
        if (this.node.operation) {
            this.toscaService.loadNodeTemplateOperationParameter(
                this.node.template,
                this.node.nodeInterface,
                this.node.operation)
                .subscribe(params => {
                    this.node.input = [];
                    this.node.output = [];

                    params.input.forEach(param => {
                        const p = new Parameter(param, '', ValueSource[ValueSource.string]);
                        this.node.input.push(p);
                    });

                    params.output.forEach(param => {
                        const p = new Parameter(param, '', ValueSource[ValueSource.Definition]);
                        this.node.output.push(p);
                    });
                });
        }
    }
}
