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
import { isNullOrUndefined } from 'util';

import { PlanModel } from '../model/plan-model';
import { PlanTreeviewItem } from '../model/plan-treeview-item';
import { RestConfig } from '../model/rest-config';
import {
    Swagger,
    SwaggerModel,
    SwaggerModelSimple,
    SwaggerPrimitiveObject,
    SwaggerReferenceObject
} from '../model/swagger';
import { ErrorEvent } from '../model/workflow/error-event';
import { IntermediateCatchEvent } from '../model/workflow/intermediate-catch-event';
import { NodeType } from '../model/workflow/node-type.enum';
import { Parameter } from '../model/workflow/parameter';
import { Position } from '../model/workflow/position';
import { RestTask } from '../model/workflow/rest-task';
import { SequenceFlow } from '../model/workflow/sequence-flow';
import { StartEvent } from '../model/workflow/start-event';
import { SubProcess } from '../model/workflow/sub-process';
import { ToscaNodeTask } from '../model/workflow/tosca-node-task';
import { WorkflowNode } from '../model/workflow/workflow-node';
import { NodeTemplate } from '../model/topology/node-template';
import { ValueSource } from '../model/value-source.enum';
import { BroadcastService } from './broadcast.service';
import { RestService } from './rest.service';
import { SwaggerTreeConverterService } from './swagger-tree-converter.service';
import { TimerEventDefinition, TimerEventDefinitionType } from "../model/workflow/timer-event-definition";
import { InterfaceService } from './interface.service';
import { ServiceTask } from '../model/workflow/service-task';
import { NodeTypeService } from './node-type.service';
import { WorkflowUtil } from '../util/workflow-util';
import { TranslateService } from '@ngx-translate/core';
import { NoticeService } from './notice.service';

/**
 * ModelService
 * provides all operations about plan model.
 */
@Injectable()
export class ModelService {
    public rootNodeId = 'root';

    private planModel: PlanModel = new PlanModel();
    private tempPlanModel: PlanModel = new PlanModel();

    constructor(private interfaceService: InterfaceService, private broadcastService: BroadcastService,
        private restService: RestService, private nodeTypeService: NodeTypeService,
        private translate: TranslateService, private notice: NoticeService) {
        this.broadcastService.initModel$.subscribe(planModel => {
            planModel.data.nodes.forEach(node => {
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
            this.planModel = planModel;
            this.tempPlanModel = WorkflowUtil.deepClone(this.planModel);
        });
        // Do not use restConfig property.
        // this.broadcastService.updateModelRestConfig$.subscribe(restConfigs => {
        //     this.updateRestConfig(restConfigs);
        // });
    }

    public getPlanModel(): PlanModel {
        return this.planModel;
    }

    public getChildrenNodes(parentId: string): WorkflowNode[] {
        if (!parentId || parentId === this.rootNodeId) {
            return this.planModel.data.nodes;
        } else {
            const node = this.getNodeMap().get(parentId);
            if (node.type === 'subProcess') {
                return (<SubProcess>node).children;
            } else {
                return [];
            }
        }
    }

    public getNodes(): WorkflowNode[] {
        return this.planModel.data.nodes;
    }

    public getSequenceFlow(sourceRef: string, targetRef: string): SequenceFlow {
        const node = this.getNodeMap().get(sourceRef);
        if (node) {
            const sequenceFlow = node.connection.find(tmp => tmp.targetRef === targetRef);
            return sequenceFlow;
        } else {
            return null;
        }
    }

    public addNode(type: string, typeId: string, name: string, left: number, top: number) {
        const id = this.generateNodeProperty('id', type);
        const nodeName = this.generateNodeProperty('name', name);
        const workflowPos = new Position(left, top);
        let node;
        if ('serviceTask' === type || 'scriptTask' === type || 'restTask' === type) {
            node = this.createNodeByTypeId(id, nodeName, type, typeId, workflowPos);
        } else {
            node = this.createNodeByType(id, nodeName, type, workflowPos);
        }
        this.planModel.data.nodes.push(node);
    }

    private generateNodeProperty(key: string, type: string): string {
        let nodeProperty = type;
        const nodes = this.getNodes();
        console.log(nodes);
        const existNode = nodes.find(node => node[key] === nodeProperty);
        if (existNode) {
            let count = 2;
            do {
                nodeProperty = type + '_' + count;
                count++;
            } while (nodes.find(node => node[key] === nodeProperty))
        }
        return nodeProperty;
    }

    private generateNodeName(typeId: string): string {
        const language = this.translate.currentLang.indexOf('en') > -1 ? 'en_US' : 'zh_CN';
        const nodeType = this.nodeTypeService.getNodeDataTypeById(typeId);
        let displayName;
        if (nodeType.displayName && nodeType.displayName[language]) {
            displayName = nodeType.displayName[language];
        } else {
            displayName = nodeType.type;
        }
        return this.generateNodeProperty('name', displayName);
    }

    public createNodeByTypeId(id: string, name: string, type: string, typeId: string, position: Position): WorkflowNode {
        const nodeDataType = this.nodeTypeService.getNodeDataTypeById(typeId);
        const initPosition = new Position(position.left, position.top, nodeDataType.icon.width, nodeDataType.icon.height);
        // switch (type) {
        //     case NodeType[NodeType.serviceTask]:
        //         let serviceTask: ServiceTask = {
        //             id: id, type: type, name: name, parentId: this.rootNodeId,
        //             position: initPosition, connection: [], class: nodeDataType.activity.class,
        //             input: nodeDataType.activity.input, output: nodeDataType.activity.output
        //         };
        //         return serviceTask;
        //     case NodeType[NodeType.scriptTask]:
        //         let scriptTask: ScriptTask = {
        //             id: id, type: type, name: name, parentId: this.rootNodeId,
        //             position: initPosition, connection: [], scriptFormat: nodeDataType.activity.scriptFormat,
        //             script: nodeDataType.activity.script
        //         };
        //         return scriptTask;
        //     case NodeType[NodeType.restTask]:
        //         let restTaskNode: RestTask = {
        //             id: id, type: type, name: name, parentId: this.rootNodeId,
        //             position: initPosition, connection: [], produces: [], consumes: [], parameters: [], responses: []
        //         };
        //         return restTaskNode;
        //     default:
        let node: WorkflowNode = {
            id: id, type: type, typeId: nodeDataType.id, icon: nodeDataType.icon.name, name: name,
            parentId: this.rootNodeId, position: initPosition, connection: []
        };
        return node;
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
            case NodeType[NodeType.errorStartEvent]:
            case NodeType[NodeType.errorEndEvent]:
                let errorEventNode: ErrorEvent = {
                    id: id,
                    type: type,
                    name: '',
                    parentId: this.rootNodeId,
                    position: smallPosition,
                    connection: [],
                    parameter: new Parameter('errorRef', '', ValueSource[ValueSource.string])
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
                    id: id,
                    type: type,
                    name: name,
                    parentId: this.rootNodeId,
                    position: bigPosition,
                    connection: [],
                    timerEventDefinition: <TimerEventDefinition>{ type: TimerEventDefinitionType[TimerEventDefinitionType.timeDuration] }
                };
                return intermediateCatchEvent;
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

    public changeParent(id: string, originalParentId: string, targetParentId: string) {
        if (originalParentId === targetParentId) {
            return;
        }

        const node: WorkflowNode = this.deleteNode(originalParentId, id);
        node.parentId = targetParentId;

        if (targetParentId) {
            this.addChild(targetParentId, node);
        } else {
            this.planModel.data.nodes.push(node);
        }
    }

    public updatePosition(id: string, left: number, top: number, width: number, height: number) {
        const node = this.getNodeMap().get(id);
        node.position.left = left;
        node.position.top = top;
        node.position.width = width;
        node.position.height = height;
    }

    public updateRestConfig(restConfigs: RestConfig[]): void {
        this.planModel.data.configs = { restConfigs: restConfigs };
        // console.log(this.planModel.configs);
    }

    public getNodeMap(): Map<string, WorkflowNode> {
        const map = new Map<string, WorkflowNode>();
        this.toNodeMap(this.planModel.data.nodes, map);
        return map;
    }

    public getAncestors(id: string): WorkflowNode[] {
        const nodeMap = this.getNodeMap();
        const ancestors = [];

        let ancestor = nodeMap.get(id);
        do {
            ancestor = this.getParentNode(ancestor.id, nodeMap);
            if (ancestor && ancestor.id !== id) {
                ancestors.push(ancestor);
            }
        } while (ancestor);

        return ancestors;
    }

    private getParentNode(id: string, nodeMap: Map<string, WorkflowNode>): WorkflowNode {
        let parentNode;
        nodeMap.forEach((node, key) => {
            if (NodeType[NodeType.subProcess] === node.type) {
                const childNode = (<SubProcess>node).children.find(child => child.id === id);
                if (childNode) {
                    parentNode = node;
                }
            }

        });

        return parentNode;
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

    private toNodeMap(nodes: WorkflowNode[], map: Map<string, WorkflowNode>) {
        nodes.forEach(node => {
            if (node.type === 'subProcess') {
                this.toNodeMap((<SubProcess>node).children, map);
            }
            map.set(node.id, node);
        });
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

    public getPlanParameters(nodeId: string): PlanTreeviewItem[] {
        const preNodeList = new Array<WorkflowNode>();
        this.getPreNodes(nodeId, this.getNodeMap(), preNodeList);

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

        if (node.responses && node.responses.length !== 0) { // load rest responses
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

    public getPreNodes(nodeId: string, nodeMap: Map<string, WorkflowNode>, preNodes: WorkflowNode[]) {
        const preNode4CurrentNode = [];
        nodeMap.forEach(node => {
            if (this.isPreNode(node, nodeId)) {
                const existNode = preNodes.find(tmpNode => tmpNode.id === node.id);
                if (existNode) {
                    // current node already exists. this could avoid loop circle.
                } else {
                    preNode4CurrentNode.push(node);
                    preNodes.push(node);
                }
            }
        });

        preNode4CurrentNode.forEach(node => this.getPreNodes(node.id, nodeMap, preNodes));
    }

    public isPreNode(preNode: WorkflowNode, id: string): boolean {
        const targetNode = preNode.connection.find(connection => connection.targetRef === id);
        return targetNode !== undefined;
    }

    public save(callback?: Function) {
        console.log('****************** save data *********************');
        console.log(JSON.stringify(this.planModel));
        // Check data
        if(!this.checkData()){
            return;
        }
        this.interfaceService.saveModelData(this.planModel).subscribe(response => {
            this.translate.get('WORKFLOW.MSG.SAVE_SUCCESS').subscribe((res: string) => {
                this.notice.success(res);
                // Update the cache.
                this.tempPlanModel = WorkflowUtil.deepClone(this.planModel);
                if (callback) {
                    callback();
                }
            });
        }, error => {
            this.translate.get('WORKFLOW.MSG.SAVE_FAIL').subscribe((res: string) => {
                this.notice.error(res);
            });
        });
        ;
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

    public isModify(): boolean {
        // Compare the cache.
        return JSON.stringify(this.planModel) != JSON.stringify(this.tempPlanModel);
    }

    private checkData(): boolean {
        if (this.planModel && this.planModel.data && this.planModel.data.nodes) {
            let nodes = this.planModel.data.nodes;
            for (let index = 0; index < nodes.length; index++) {
                const node = nodes[index];
                if (NodeType[NodeType.startEvent] === node.type) {
                    let startEvent = node as StartEvent;
                    if (startEvent.parameters) {
                        for (let i = 0; i < startEvent.parameters.length; i++) {
                            const parameter = startEvent.parameters[i];
                            if (!parameter.name) {
                                this.translate.get('WORKFLOW.MSG.PROCESS_VARIABLE_EMPTY').subscribe((res: string) => {
                                    this.notice.error(res);
                                });
                                return false;
                            }
                            if(i + 1 < startEvent.parameters.length){
                            for (let j = i + 1; j < startEvent.parameters.length; j++) {
                                const param = startEvent.parameters[j];
                                if(parameter.name === param.name){
                                    this.translate.get('WORKFLOW.MSG.PROCESS_VARIABLE_SAME').subscribe((res: string) => {
                                        this.notice.error(res);
                                    });
                                    return false;
                                }
                            }
                        }
                        }
                    }
                }
            }
        }
        return true;
    }
}
