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

import { AfterViewInit, Component, HostListener } from '@angular/core';

import { BroadcastService } from '../../services/broadcast.service';
import { JsPlumbService } from '../../services/jsplumb.service';
import { ActivatedRoute } from "@angular/router";
import { DataAccessService } from "../../services/data-access/data-access.service";
import { WorkflowService } from "../../services/workflow.service";
import { Workflow } from "../../model/workflow/workflow";
import { WorkflowProcessService } from "../../services/workflow-process.service";
import { SequenceFlow } from "../../model/workflow/sequence-flow";
import { WorkflowNode } from "../../model/workflow/workflow-node";

/**
 * main canvas, it contains two parts: canvas and node property component
 * bpmn task nodes can be dropped into this canvas, and then the workflow can be edit
 */
@Component({
    selector: 'b4t-canvas',
    styleUrls: ['./canvas.component.css'],
    templateUrl: 'canvas.component.html',
})
export class CanvasComponent implements AfterViewInit {
    private currentType: string; // WorkflowNode, SequenceFlow
    private currentWorkflowNode: WorkflowNode;
    private currentSequenceFlow: SequenceFlow;


    constructor(private broadcastService: BroadcastService,
        private dataAccessService: DataAccessService,
        private jsPlumbService: JsPlumbService,
        private route: ActivatedRoute,
        private workflowService: WorkflowService,
        private processService: WorkflowProcessService) {
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params.id) {
                this.dataAccessService.catalogService.loadWorkflow(params.id).subscribe(workflow => {
                    this.workflowService.workflow = workflow;
                });
            }
        });
    }

    public ngAfterViewInit() {
        this.jsPlumbService.buttonDroppable();
        this.broadcastService.currentSequenceFlow$.subscribe(sequenceFlow => this.currentSequenceFlow = sequenceFlow);
        this.broadcastService.currentWorkflowNode$.subscribe(workflowNode => this.currentWorkflowNode = workflowNode);
        this.broadcastService.currentType$.subscribe(type => this.currentType = type);
    }

    public canvasClick() {
        this.broadcastService.broadcast(this.broadcastService.showProperty, false);
        this.broadcastService.broadcast(this.broadcastService.showSequenceFlow, false);
    }

    @HostListener('window:keyup.delete', ['$event']) ondelete(event: KeyboardEvent) {
        if (this.currentType === 'WorkflowNode') {
            this.jsPlumbService.remove(this.currentWorkflowNode.id);
            this.processService.deleteNode(this.currentWorkflowNode.id);
        } else if (this.currentType === 'SequenceFlow') {
            this.processService.deleteSequenceFlow(this.currentSequenceFlow.sourceRef, this.currentSequenceFlow.targetRef);
            this.jsPlumbService.deleteConnect(this.currentSequenceFlow.sourceRef, this.currentSequenceFlow.targetRef);
        }
    }


    public getWorkflow(): Workflow {
        return this.workflowService.workflow;
    }
}
