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
import { Component, OnInit, ViewChild } from '@angular/core';

import { WorkflowService } from '../../services/workflow.service';
import { MicroserviceComponent } from "./microservice/microservice.component";
import { WorkflowsComponent } from "./workflows/workflows.component";
import { BroadcastService } from "../../services/broadcast.service";
import { PlanModel } from "../../model/workflow/plan-model";

@Component({
    selector: 'b4t-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent {
    @ViewChild(MicroserviceComponent) public microserviceComponent: MicroserviceComponent;
    @ViewChild(WorkflowsComponent) public workflowsComponent: WorkflowsComponent;
    public currentWorkflow = 'Workflows';
    public workflows = [];

    constructor(private broadcastService: BroadcastService, private workflowService: WorkflowService) {
        this.broadcastService.workflows.subscribe(wfs => {
            this.workflows.splice(0, this.workflows.length);
            if(wfs) {
                wfs.forEach((value, key, map) => {
                    this.workflows.push({label: value.planName, command: () => {
                        this.workflowSelected(value.planName, value.plan);
                    }});
                });
            }
        });
    }

    public save(): void {
        this.workflowService.save();
    }

    public showMicroserviceModal(): void {
        this.microserviceComponent.show();
    }

    public test() {
    }

    public showWorkflows() {
        this.workflowsComponent.show();
    }

    public getWorkflows() {
        const workflows = this.workflowService.getWorkflows();
        if(workflows) {
            const options = [];
            workflows.forEach((value, key, map) => {
                options.push({label: value.planName, command: () => {
                    this.workflowSelected(value.planName, value.plan);
                }});
            });
            return options;
        } else {
            return [];
        }
    }

    public workflowSelected(planName: string, workflow: PlanModel) {
        this.currentWorkflow = planName;
        this.broadcastService.broadcast(this.broadcastService.workflow, workflow);
    }

    public download() {
        const filename = this.currentWorkflow + '.json';
        const content = JSON.stringify(this.workflowService.planModel);
        var eleLink = document.createElement('a');
        eleLink.download = filename;
        eleLink.style.display = 'none';
        var blob = new Blob([content]);
        eleLink.href = URL.createObjectURL(blob);
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);
    }
}
