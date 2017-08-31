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

import { BroadcastService } from '../../services/broadcast.service';
import { JsPlumbService } from '../../services/jsplumb.service';
import { ActivatedRoute } from "@angular/router";
import { DataAccessService } from "../../services/data-access/data-access.service";
import { WorkflowService } from "../../services/workflow.service";
import { Workflow } from "../../model/workflow/workflow";

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

    constructor(private broadcastService: BroadcastService,
        private dataAccessService: DataAccessService,
        private jsPlumbService: JsPlumbService,
        private route: ActivatedRoute,
        private workflowService: WorkflowService) {
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
    }

    public canvasClick() {
        this.broadcastService.broadcast(this.broadcastService.showProperty, false);
    }


    public getWorkflow(): Workflow {
        return this.workflowService.workflow;
    }
}
