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
import { PlanModel } from "../model/workflow/plan-model";
import { Position } from "../model/workflow/position";
import { NodeType } from "../model/workflow/node-type.enum";
import { StartEvent } from "../model/workflow/start-event";
import { SequenceFlow } from "../model/workflow/sequence-flow";
import { RestTask } from "../model/workflow/rest-task";
import { ErrorEvent } from "../model/workflow/error-event";
import { PlanTreeviewItem } from "../model/plan-treeview-item";
import { WorkflowConfigService } from "./workflow-config.service";
import { Swagger, SwaggerModelSimple, SwaggerReferenceObject } from "../model/swagger";
import { WorkflowService } from "./workflow.service";
import { IntermediateCatchEvent } from "../model/workflow/intermediate-catch-event";
import { ScriptTask } from "../model/workflow/script-task";
import { ToscaNodeTask } from '../model/workflow/tosca-node-task';
import { NodeTemplate } from '../model/topology/node-template';
import { SubProcess } from '../model/workflow/sub-process';
import { TimerEventDefinition, TimerEventDefinitionType } from '../model/workflow/timer-event-definition';
import { Parameter } from '../model/workflow/parameter';
import { ValueSource } from '../model/value-source.enum';
import { RestService } from './rest.service';
import { BroadcastService } from './broadcast.service';
import { RestConfig } from '../model/rest-config';

/**
 * WorkflowService
 * provides all of the operations about workflow operations.
 */
@Injectable()
export class ModelService {
    public rootNodeId = 'root';

    private planModel: PlanModel = new PlanModel();

    constructor(private broadcastService: BroadcastService, private restService: RestService, private workflowService: WorkflowService, private configService: WorkflowConfigService) {
        this.broadcastService.planModel$.subscribe(plan => {
            plan.nodes.forEach(node => {
                switch (node.type) {
                    case NodeType[NodeType.startEvent]:
                        node.position.width = 56;
                        node.position.height = 56;
                        break;
                    case NodeType[NodeType.endEvent]:
                        node.position.width = 56;
                        node.position.height = 56;
                        break;
                    case NodeType[NodeType.restTask]:
                        node.position.width = 56;
                        node.position.height = 56;
                        break;
                    case NodeType[NodeType.errorStartEvent]:
                    case NodeType[NodeType.errorEndEvent]:
                        node.position.width = 26;
                        node.position.height = 26;
                        break;
                    case NodeType[NodeType.toscaNodeManagementTask]:
                        node.position.width = 56;
                        node.position.height = 56;
                        break;
                    case NodeType[NodeType.subProcess]:
                        node.position.width = 56;
                        node.position.height = 56;
                        break;
                    case NodeType[NodeType.intermediateCatchEvent]:
                        node.position.width = 56;
                        node.position.height = 56;
                        break;
                    case NodeType[NodeType.scriptTask]:
                        node.position.width = 56;
                        node.position.height = 56;
                        break;
                    case NodeType[NodeType.exclusiveGateway]:
                    case NodeType[NodeType.parallelGateway]:
                        node.position.width = 26;
                        node.position.height = 26;
                        break;
                    default:
                        node.position.width = 56;
                        node.position.height = 56;
                        break;
                }
            });
            this.planModel = plan;
        });
        this.broadcastService.updateModelRestConfig$.subscribe(restConfigs => {
            this.updateRestConfig(restConfigs);
        });
    }

    public getProcess(): WorkflowNode[] {
        return this.workflowService.planModel.nodes;
    }

    public getNodes(): WorkflowNode[] {
        return this.planModel.nodes;
    }

    public addConnection(sourceId: string, targetId: string) {
        const node = this.getNodeMap().get(sourceId);
        if (node) {
            const index = node.connection.findIndex(sequenceFlow => sequenceFlow.targetRef === targetId);
            if (index === -1) {
                const sequenceFlow: SequenceFlow = { sourceRef: sourceId, targetRef: targetId };
                node.connection.push(sequenceFlow);
            }
        }
    }

    public deleteConnection(sourceId: string, targetId: string) {
        const node = this.getNodeMap().get(sourceId);
        if (node) {
            const index = node.connection.findIndex(sequenceFlow => sequenceFlow.targetRef === targetId);
            if (index !== -1) {
                node.connection.splice(index, 1);
            }
        }
    }

    public deleteNode(parentId: string, nodeId: string): WorkflowNode {
        const nodeMap = this.getNodeMap();

        const nodes = this.getChildrenNodes(parentId);

        // delete related connections
        nodes.forEach(node => this.deleteConnection(node.id, nodeId));

        // delete current node
        const index = nodes.findIndex(node => node.id === nodeId);
        if (index !== -1) {
            const node = nodes.splice(index, 1)[0];
            node.connection = [];
            return node;
        }

        return null;
    }

    public addChild(parentId: string, child: WorkflowNode) {
        this.getChildrenNodes(parentId).push(child);
    }

    public deleteChild(node: SubProcess, id: string): WorkflowNode {
        const index = node.children.findIndex(child => child.id === id);
        if (index !== -1) {
            const deletedNode = node.children.splice(index, 1);
            return deletedNode[0];
        }

        return null;
    }

    public updateRestConfig(restConfigs: RestConfig[]): void {
        this.planModel.configs = { restConfigs: restConfigs };
        // console.log(this.planModel.configs);
    }

    public getNodeMap(): Map<string, WorkflowNode> {
        const map = new Map<string, WorkflowNode>();
        this.toNodeMap(this.planModel.nodes, map);
        return map;
    }

    private toNodeMap(nodes: WorkflowNode[], map: Map<string, WorkflowNode>) {
        nodes.forEach(node => {
            if (node.type === 'subProcess') {
                this.toNodeMap((<SubProcess>node).children, map);
            }
            map.set(node.id, node);
        });
    }

    public addNode(name: string, type: string, left: number, top: number) {
        const id = this.createId();
        const workflowPos = new Position(left, top);
        const node = this.createNodeByType(id, name, type, workflowPos);
        this.planModel.nodes.push(node);
    }

    private createNodeByType(id: string, name: string, type: string, position: Position): WorkflowNode {
        const bigPosition = new Position(position.left, position.top, 56, 56);
        const smallPosition = new Position(position.left, position.top, 26, 26);
        switch (type) {
            case NodeType[NodeType.startEvent]:
                let startEventNode: StartEvent = {
                    id: id, type: type, name: name, parentId: this.rootNodeId,
                    position: bigPosition, connection: [], parameters: []
                };
                return startEventNode;
            case NodeType[NodeType.endEvent]:
                let endEventNode: WorkflowNode = {
                    id: id, type: type, name: name, parentId: this.rootNodeId,
                    position: bigPosition, connection: []
                };
                return endEventNode;
            case NodeType[NodeType.restTask]:
                let restTaskNode: RestTask = {
                    id: id, type: type, name: name, parentId: this.rootNodeId,
                    position: bigPosition, connection: [], produces: [], consumes: [], parameters: [], responses: []
                };
                return restTaskNode;
            case NodeType[NodeType.errorStartEvent]:
            case NodeType[NodeType.errorEndEvent]:
                let errorEventNode: ErrorEvent = {
                    id: id, type: type, name: '', parentId: this.rootNodeId,
                    position: smallPosition, connection: [], parameter: new Parameter('errorRef', '', ValueSource[ValueSource.String])
                };
                return errorEventNode;
            case NodeType[NodeType.toscaNodeManagementTask]:
                let toscaNodeTask: ToscaNodeTask = {
                    id: id, type: type, name: name, parentId: this.rootNodeId,
                    position: bigPosition, connection: [], input: [], output: [], template: new NodeTemplate()
                };
                return toscaNodeTask;
            case NodeType[NodeType.subProcess]:
                let subProcess: SubProcess = {
                    id: id, type: type, name: name, parentId: this.rootNodeId,
                    position: bigPosition, connection: [], children: []
                };
                return subProcess;
            case NodeType[NodeType.intermediateCatchEvent]:
                let intermediateCatchEvent: IntermediateCatchEvent = {
                    id: id, type: type, name: name, parentId: this.rootNodeId,
                    position: bigPosition, connection: [], timerEventDefinition: <TimerEventDefinition>{ type: TimerEventDefinitionType[TimerEventDefinitionType.timeDuration] }
                };
                return intermediateCatchEvent;
            case NodeType[NodeType.scriptTask]:
                let scriptTask: ScriptTask = {
                    id: id, type: type, name: name, parentId: this.rootNodeId,
                    position: bigPosition, connection: [], scriptFormat: 'JavaScript'
                };
                return scriptTask;
            case NodeType[NodeType.exclusiveGateway]:
            case NodeType[NodeType.parallelGateway]:
                let getway: WorkflowNode = {
                    id: id, type: type, name: '', parentId: this.rootNodeId,
                    position: smallPosition, connection: []
                };
                return getway;
            default:
                let node: WorkflowNode = {
                    id: id, type: type, name: name, parentId: this.rootNodeId,
                    position: bigPosition, connection: []
                };
                return node;
        }
    }

    public isNode(object: any): boolean {
        return undefined !== object.type;
    }

    public getSequenceFlow(sourceRef: string, targetRef: string): SequenceFlow {
        const node = this.getNodeById(sourceRef);
        if (node) {
            const sequenceFlow = node.connection.find(tmp => tmp.targetRef === targetRef);
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
                case NodeType[NodeType.toscaNodeManagementTask]:
                    params.push(this.loadOutput4ToscaNodeTask(<ToscaNodeTask>node));
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
        const startItem = new PlanTreeviewItem(node.name, `[${node.id}]`, [], false);
        node.parameters.map(param =>
            startItem.children.push(new PlanTreeviewItem(param.name, `[${param.name}]`, [])));
        return startItem;
    }

    private loadOutput4ToscaNodeTask(node: ToscaNodeTask): PlanTreeviewItem {
        const item = new PlanTreeviewItem(node.name, `[${node.id}]`, [], false);
        item.children.push(this.createStatusCodeTreeViewItem(node.id));
        const responseItem = this.createResponseTreeViewItem(node.id);
        item.children.push(responseItem);

        node.output.map(param =>
            responseItem.children.push(new PlanTreeviewItem(param.name, `${responseItem.value}.[${param.name}]`, [])));
        return item;
    }

    private loadOutput4RestTask(node: RestTask): PlanTreeviewItem {
        const item = new PlanTreeviewItem(node.name, `[${node.id}]`, [], false);
        item.children.push(this.createStatusCodeTreeViewItem(node.id));

        if (node.responses.length !== 0) { // load rest responses
            const responseItem = this.createResponseTreeViewItem(node.id);
            item.children.push(responseItem);
            // todo: should list all available response or only the first one?
            if (node.responses[0]) {
                const swagger = this.restService.getSwaggerInfo(node.restConfigId);
                const SwaggerReferenceObject = node.responses[0].schema as SwaggerReferenceObject;
                const swaggerDefinition = this.restService.getDefinition(swagger, SwaggerReferenceObject.$ref);
                this.loadParamsBySwaggerDefinition(responseItem, swagger, swaggerDefinition);
            }
        }

        return item;
    }

    private loadParamsBySwaggerDefinition(parentItem: PlanTreeviewItem, swagger: Swagger, definition: any) {
        Object.getOwnPropertyNames(definition.properties).map(key => {
            const property = definition.properties[key];
            const value = `${parentItem.value}.[${key}]`;
            const propertyItem = new PlanTreeviewItem(key, value, []);
            parentItem.children.push(propertyItem);

            // reference to swagger.ts function getSchemaObject()
            if (property instanceof SwaggerReferenceObject) {
                // handle reference parameter.
                const propertyDefinition = this.restService.getDefinition(swagger, property.$ref);
                this.loadParamsBySwaggerDefinition(propertyItem, swagger, propertyDefinition);
            } else if (property instanceof SwaggerModelSimple) {
                // handle object parameter.
                this.loadParamsBySwaggerDefinition(propertyItem, swagger, property);
            } else {
                // skip
            }

            return propertyItem;
        });
    }

    private createStatusCodeTreeViewItem(nodeId: string): PlanTreeviewItem {
        return new PlanTreeviewItem('statusCode', `[${nodeId}].[statusCode]`, []);
    }

    private createResponseTreeViewItem(nodeId: string): PlanTreeviewItem {
        return new PlanTreeviewItem('response', `[${nodeId}].[responseBody]`, []);
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
        const targetNode = preNode.connection.find(connection => connection.targetRef === id);
        return targetNode !== undefined;
    }

    public getNodeById(sourceId: string): WorkflowNode {
        return this.getProcess().find(node => node.id === sourceId);
    }

    private createId() {
        const nodeMap = this.getNodeMap();

        for (let i = 0; i < nodeMap.size; i++) {
            const key = 'node' + i;
            if (!nodeMap.get(key)) {
                return key;
            }
        }

        return 'node' + nodeMap.size;
    }

    public getChildrenNodes(parentId: string): WorkflowNode[] {
        if (!parentId || parentId === this.rootNodeId) {
            return this.planModel.nodes;
        } else {
            const node = this.getNodeMap().get(parentId);
            if (node.type === 'subProcess') {
                return (<SubProcess>node).children;
            } else {
                return [];
            }
        }
    }

    public changeParent(id: string, originalParentId: string, targetParentId: string) {
        if (originalParentId === targetParentId) {
            return;
        }

        const node: WorkflowNode = this.deleteNode(originalParentId, id);
        node.parentId = targetParentId;

        if (targetParentId) {
            this.addChild(targetParentId, node);
        } else {
            this.planModel.nodes.push(node);
        }
    }

    public updatePosition(id: string, left: number, top: number, width: number, height: number) {
        const node = this.getNodeMap().get(id);
        node.position.left = left;
        node.position.top = top;
        node.position.width = width;
        node.position.height = height;
    }

    public isDescendantNode(node: WorkflowNode, descendantId: string): boolean {
        if (NodeType[NodeType.subProcess] !== node.type) {
            return false;
        }
        const tmp = (<SubProcess>node).children.find(child => {
            return child.id === descendantId || (NodeType[NodeType.subProcess] === child.type && this.isDescendantNode(<SubProcess>child, descendantId));
        });

        return tmp !== undefined;
    }
}
