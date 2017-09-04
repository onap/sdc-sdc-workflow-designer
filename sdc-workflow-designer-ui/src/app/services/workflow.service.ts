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
import { DataAccessService } from "./data-access/data-access.service";
import { Observable } from "rxjs/Observable";
import { Workflow } from "../model/workflow/workflow";
import { Position } from "../model/workflow/position";
import { NodeType } from "../model/workflow/node-type.enum";
import { StartEvent } from "../model/workflow/start-event";
import { SequenceFlow } from "../model/workflow/sequence-flow";
import { RestTask } from "../model/workflow/rest-task";

/**
 * WorkflowService
 * provides all of the operations about workflow operations.
 */
@Injectable()
export class WorkflowService {

    public workflow: Workflow;

    constructor(private dataAccessService: DataAccessService) {

    }

    public save(): Observable<boolean> {
        console.log(this.workflow);
        return this.dataAccessService.catalogService.saveWorkflow(this.workflow);
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
            default:
                node = new WorkflowNode(this.createId(), name, type, new Position(top, left), []);
                break;
        }

        this.workflow.nodes.push(node);
        return node;
    }

    public deleteNode(nodeId: string): WorkflowNode {
        // delete related connections
        this.workflow.nodes.forEach(node => this.deleteSequenceFlow(node.id, nodeId));

        // delete current node
        const index = this.workflow.nodes.findIndex(node => node.id === nodeId);
        if (index !== -1) {
            const node = this.workflow.nodes.splice(index, 1)[0];
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

    public getNodeById(sourceId: string): WorkflowNode {
        return this.workflow.nodes.find(node => node.id === sourceId);
    }

    private createId() {
        const idSet = new Set();
        this.workflow.nodes.forEach(node => idSet.add(node.id));

        for (let i = 0; i < idSet.size; i++) {
            if (!idSet.has('node' + i)) {
                return 'node' + i;
            }
        }

        return 'node' + idSet.size;
    }
}
