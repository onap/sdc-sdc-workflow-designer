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
import { WorkflowNode } from "../model/workflow/workflow-node";
import { Workflow } from "../model/workflow/workflow";
import { Position } from "../model/workflow/position";
import { NodeType } from "../model/workflow/node-type.enum";
import { StartEvent } from "../model/workflow/start-event";
import { SequenceFlow } from "../model/workflow/sequence-flow";
import { RestTask } from "../model/workflow/rest-task";
import { PlanTreeviewItem } from "../model/plan-treeview-item";
import { WorkflowConfigService } from "./workflow-config.service";
import { Swagger, SwaggerModelSimple, SwaggerReferenceObject } from "../model/swagger";
import { WorkflowService } from "./workflow.service";
import { IntermediateCatchEvent } from "../model/workflow/intermediate-catch-event";
import { ScriptTask } from "../model/workflow/script-task";

/**
 * WorkflowService
 * provides all of the operations about workflow operations.
 */
@Injectable()
export class WorkflowProcessService {

    constructor(private workflowService: WorkflowService, private configService: WorkflowConfigService) {

    }

    public getProcess(): WorkflowNode[] {
        return this.workflowService.planModel.nodes;
    }

    public addNode(name: string, type: string, top: number, left: number): WorkflowNode {
        let node: WorkflowNode;
        switch (type) {
            case NodeType[NodeType.startEvent]:
                node = new StartEvent(this.createId(), name, type, new Position(top, left), []);
                break;
            case NodeType[NodeType.restTask]:
                node = new RestTask(this.createId(), name, type, new Position(top, left), []);
                break;
            case NodeType[NodeType.intermediateCatchEvent]:
                node = new IntermediateCatchEvent(this.createId(), name, type, new Position(top, left), []);
                break;
            case NodeType[NodeType.scriptTask]:
                node = new ScriptTask(this.createId(), name, type, new Position(top, left), []);
                break;
            default:
                node = new WorkflowNode(this.createId(), name, type, new Position(top, left), []);
                break;
        }

        this.getProcess().push(node);
        return node;
    }

    public deleteNode(nodeId: string): WorkflowNode {
        // delete related connections
        this.getProcess().forEach(node => this.deleteSequenceFlow(node.id, nodeId));

        // delete current node
        const index = this.getProcess().findIndex(node => node.id === nodeId);
        if (index !== -1) {
            const node = this.getProcess().splice(index, 1)[0];
            node.sequenceFlows = [];
            return node;
        }

        return undefined;
    }

    public addSequenceFlow(sourceId: string, targetId: string) {
        const node = this.getNodeById(sourceId);
        if (node) {
            const index = node.sequenceFlows.findIndex(sequenceFlow => sequenceFlow.targetRef === targetId);
            if (index === -1) {
                node.sequenceFlows.push(new SequenceFlow(sourceId, targetId));
            }
        }
    }

    public deleteSequenceFlow(sourceId: string, targetId: string) {
        const node = this.getNodeById(sourceId);
        if (node) {
            const index = node.sequenceFlows.findIndex(sequenceFlow => sequenceFlow.targetRef === targetId);
            if (index !== -1) {
                node.sequenceFlows.splice(index, 1);
            }
        }
    }

    public getSequenceFlow(sourceRef: string, targetRef: string): SequenceFlow {
        const node = this.getNodeById(sourceRef);
        if (node) {
            const sequenceFlow = node.sequenceFlows.find(tmp => tmp.targetRef === targetRef);
            return sequenceFlow;
        } else {
            return undefined;
        }
    }

    public getPlanParameters(nodeId: string): PlanTreeviewItem[] {
        const preNodeList = new Array<WorkflowNode>();
        this.getPreNodes(nodeId, preNodeList);

        return this.loadNodeOutputs(preNodeList);
    }

    private loadNodeOutputs(nodes: WorkflowNode[]): PlanTreeviewItem[] {
        const params = new Array<PlanTreeviewItem>();
        nodes.forEach(node => {
            switch (node.type) {
                case NodeType[NodeType.startEvent]:
                    params.push(this.loadOutput4StartEvent(<StartEvent>node));
                    break;
                case NodeType[NodeType.restTask]:
                    params.push(this.loadOutput4RestTask(<RestTask>node));
                    break;
                default:
                    break;
            }
        });

        return params;
    }

    private loadOutput4StartEvent(node: StartEvent): PlanTreeviewItem {
        const startItem = new PlanTreeviewItem(node.name, `[${node.id}]`, []);
        node.parameters.map(param =>
            startItem.children.push(new PlanTreeviewItem(param.name, `[${param.name}]`, [])));
        return startItem;
    }

    private loadOutput4RestTask(node: RestTask): PlanTreeviewItem {
        const item = new PlanTreeviewItem(node.name, `[${node.id}]`, []);
        item.children.push(this.createStatusCodeTreeViewItem(node.id));

        if (node.responses.length !== 0) { // load rest responses
            const responseItem = this.createResponseTreeViewItem(node.id);
            item.children.push(responseItem);
            if (node.responses[0]) {
                const swagger = this.configService.getSwaggerInfo(node.serviceName, node.serviceVersion);
                const swaggerDefinition = this.configService.getDefinition(swagger, node.responses[0].schema.$ref);
                this.loadParamsBySwaggerDefinition(responseItem, swagger, <SwaggerModelSimple>swaggerDefinition);
            }
        }

        return item;
    }

    private createStatusCodeTreeViewItem(nodeId: string): PlanTreeviewItem {
        return new PlanTreeviewItem('statusCode', `[${nodeId}].[statusCode]`, []);
    }

    private createResponseTreeViewItem(nodeId: string): PlanTreeviewItem {
        return new PlanTreeviewItem('response', `[${nodeId}].[responseBody]`, []);
    }

    private loadParamsBySwaggerDefinition(parentItem: PlanTreeviewItem, swagger: Swagger, definition: SwaggerModelSimple) {
        Object.getOwnPropertyNames(definition.properties).map(key => {
            const property = definition.properties[key];
            const value = `${parentItem.value}.[${key}]`;
            const propertyItem = new PlanTreeviewItem(key, value, []);
            parentItem.children.push(propertyItem);

            if (property instanceof SwaggerReferenceObject) {
                const propertyDefinition = this.configService.getDefinition(swagger, property.$ref);
                this.loadParamsBySwaggerDefinition(propertyItem, swagger,
                    <SwaggerModelSimple>propertyDefinition);
            }

            return propertyItem;
        });
    }

    public getPreNodes(nodeId: string, preNodes: WorkflowNode[]) {
        const preNode4CurrentNode = [];
        this.getProcess().forEach(node => {
            if (this.isPreNode(node, nodeId)) {
                const existNode = preNodes.find(tmpNode => tmpNode.id === node.id);
                if (existNode) {
                    // current node already exists in preNodes. this could avoid loop circle.
                } else {
                    preNode4CurrentNode.push(node);
                    preNodes.push(node);
                }
            }
        });

        preNode4CurrentNode.forEach(node => this.getPreNodes(node.id, preNodes));
    }

    public isPreNode(preNode: WorkflowNode, id: string): boolean {
        const targetNode = preNode.sequenceFlows.find(connection => connection.targetRef === id);
        return targetNode !== undefined;
    }

    public getNodeById(sourceId: string): WorkflowNode {
        return this.getProcess().find(node => node.id === sourceId);
    }

    private createId() {
        const idSet = new Set();
        this.getProcess().forEach(node => idSet.add(node.id));

        for (let i = 0; i < idSet.size; i++) {
            if (!idSet.has('node' + i)) {
                return 'node' + i;
            }
        }

        return 'node' + idSet.size;
    }
}
