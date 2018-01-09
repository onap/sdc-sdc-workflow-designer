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

/**
 * property component presents information of a workflow node.
 * the presented information can be edit in this component.
 * it may load information dynamically. the content may be different for different node type.
 */
@Component({
    selector: 'b4t-sequence-flow',
    styleUrls: ['./sequence-flow.component.css'],
    templateUrl: 'sequence-flow.component.html',
})
export class SequenceFlowComponent implements AfterViewInit {
    public sequenceFlow: SequenceFlow;
    public show = false;

    constructor(private broadcastService: BroadcastService,
                private processService: ModelService,
                private jsPlumbService: JsPlumbService) {

    }

    public ngAfterViewInit() {
        this.broadcastService.showSequenceFlow$.subscribe(show => this.show = show);
        this.broadcastService.sequenceFlow$.subscribe(tmp => this.sequenceFlow = tmp);
    }

    public conditionChanged(condition: string) {
        this.sequenceFlow.condition = condition;
        this.jsPlumbService.setLabel(this.sequenceFlow.sourceRef, this.sequenceFlow.targetRef, condition);
    }

    public delete() {
        this.show = false;

        this.processService.deleteSequenceFlow(this.sequenceFlow.sourceRef, this.sequenceFlow.targetRef);
        this.jsPlumbService.deleteConnect(this.sequenceFlow.sourceRef, this.sequenceFlow.targetRef);
    }
}
