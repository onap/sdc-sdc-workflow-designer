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

/**
 * WorkflowService
 * provides all of the operations about workflow operations.
 */
@Injectable()
export class WorkflowService {
    public nodes: WorkflowNode[] = [];

    public getNodes(): WorkflowNode[] {
        return this.nodes;
    }

    public addNode(name: string, type: string,  top: number, left: number) {
        this.nodes.push(new WorkflowNode(this.createId(), name, type, top, left));
    }

    public deleteNode(nodeId: string): WorkflowNode {
        // delete current node
        const index = this.nodes.findIndex(node => node.id === nodeId);
        if (index !== -1) {
            const node = this.nodes.splice(index, 1)[0];
            return node;
        }

        return undefined;
    }

    public getNode(sourceId: string): WorkflowNode {
        return this.nodes.find(node => node.id === sourceId);
    }

    private createId() {
        const idSet = new Set();
        this.nodes.forEach(node => idSet.add(node.id));

        for (let i = 0; i < idSet.size; i++) {
            if (!idSet.has('node' + i)) {
                return 'node' + i;
            }
        }

        return 'node' + idSet.size;
    }
}
