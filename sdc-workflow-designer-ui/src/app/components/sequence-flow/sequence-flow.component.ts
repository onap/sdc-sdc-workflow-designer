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

import { AfterViewInit, Component } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { SequenceFlow } from '../../model/workflow/sequence-flow';
import { BroadcastService } from '../../services/broadcast.service';
import { JsPlumbService } from '../../services/jsplumb.service';
import { ModelService } from '../../services/model.service';
import { NodeType } from '../../model/workflow/node-type.enum';

/**
 * property component presents information of a workflow node.
 * the presented information can be edit in this component.
 * it may load information dynamically. the content may be different for different node type.
 */
@Component({
    selector: 'wfm-sequence-flow',
    styleUrls: ['./sequence-flow.component.css'],
    templateUrl: 'sequence-flow.component.html',
})
export class SequenceFlowComponent implements AfterViewInit {
    public sequenceFlow: SequenceFlow;
    public show = false;

    constructor(private broadcastService: BroadcastService,
        private modelService: ModelService,
        private jsPlumbService: JsPlumbService) {

    }

    public ngAfterViewInit() {
        this.broadcastService.showProperty$.subscribe(element => {
            if (element && !this.modelService.isNode(element)) {
                this.sequenceFlow = element as SequenceFlow;
                this.show = true;
            } else {
                this.show = false;
            }
        });
    }

    public showCondition(sourceRef: string): boolean {
        if (sourceRef) {
            let node = this.modelService.getNodeMap().get(sourceRef);
            if (node && (NodeType[NodeType.parallelGateway] === node.type || NodeType[NodeType.exclusiveGateway] === node.type)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    public nameChanged(name: string) {
        this.sequenceFlow.name = name;
        this.jsPlumbService.setLabel(this.sequenceFlow.sourceRef, this.sequenceFlow.targetRef, name);
    }

    public delete() {
        this.show = false;
        this.modelService.deleteConnection(this.sequenceFlow.sourceRef, this.sequenceFlow.targetRef);
        this.jsPlumbService.deleteConnect(this.sequenceFlow.sourceRef, this.sequenceFlow.targetRef);
    }
}
