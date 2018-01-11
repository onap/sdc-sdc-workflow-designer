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
import { WorkflowsComponent } from "./workflows/workflows.component";
import { BroadcastService } from "../../services/broadcast.service";
import { PlanModel } from "../../model/plan-model";
import { RestConfigComponent } from './rest-config/rest-config.component';

@Component({
    selector: 'menus',
    templateUrl: './menus.component.html',
    styleUrls: ['./menus.component.css']
})
export class MenusComponent {
    @ViewChild(RestConfigComponent) public microserviceComponent: RestConfigComponent;
    @ViewChild(WorkflowsComponent) public workflowsComponent: WorkflowsComponent;
    public currentWorkflowId : string;
    public workflows = [];

    constructor(private broadcastService: BroadcastService, private workflowService: WorkflowService) {
        this.broadcastService.workflows.subscribe(wfs => {
            this.workflows.splice(0, this.workflows.length);
            if(wfs) {
                wfs.forEach((value, key, map) => {
                    this.workflows.push({label: value.planName, command: () => {
                        this.workflowSelected(key, value.plan);
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

    public workflowSelected(planId: string, planModel: PlanModel) {

        this.broadcastService.broadcast(this.broadcastService.planModel, planModel);
        this.broadcastService.broadcast(this.broadcastService.planId, planId);
    }

    public getCurrentPlanName() {
        let planName = this.workflowService.getPlanName(this.currentWorkflowId);
        return planName ? planName : 'Workflows'
    }

    public download() {
        const filename = this.getCurrentPlanName() + '.json';
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
