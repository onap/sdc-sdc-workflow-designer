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
import { WorkflowNode } from "../model/workflow-node";
import { DataAccessService } from "./data-access/data-access.service";
import { Observable } from "rxjs/Observable";
import { Workflow } from "../model/workflow";

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
        return this.dataAccessService.catalogService.saveWorkflow(this.workflow);
    }

    public addNode(name: string, type: string, top: number, left: number): WorkflowNode {
        const node = new WorkflowNode(this.createId(), name, type, top, left);
        this.workflow.nodes.push(node);
        return node;
    }

    public deleteNode(nodeId: string): WorkflowNode {
        // delete current node
        const index = this.workflow.nodes.findIndex(node => node.id === nodeId);
        if (index !== -1) {
            const node = this.workflow.nodes.splice(index, 1)[0];
            return node;
        }

        return undefined;
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
