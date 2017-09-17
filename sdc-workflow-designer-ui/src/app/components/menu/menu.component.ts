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
import { Workflow } from "../../model/workflow/workflow";

@Component({
    selector: 'b4t-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent {
    @ViewChild(MicroserviceComponent) public microserviceComponent: MicroserviceComponent;
    @ViewChild(WorkflowsComponent) public workflowsComponent: WorkflowsComponent;

    constructor(private broadcastService: BroadcastService, private workflowService: WorkflowService) {
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

    public getWorkflows(workflow: Workflow) {
        const workflows = this.workflowService.getWorkflows();
        if(workflows) {
            return workflows.map(workflow => {
                return {label: workflow.name, command: () => {
                    this.workflowSelected(workflow);
                }};
            });
        } else {
            return [];
        }
    }

    public workflowSelected(workflow: Workflow) {
        this.broadcastService.broadcast(this.broadcastService.workflow, workflow);
    }

    public download() {
        const filename = this.workflowService.workflow.name + '.json';
        const content = JSON.stringify(this.workflowService.workflow);
        // 创建隐藏的可下载链接
        var eleLink = document.createElement('a');
        eleLink.download = filename;
        eleLink.style.display = 'none';
        // 字符内容转变成blob地址
        var blob = new Blob([content]);
        eleLink.href = URL.createObjectURL(blob);
        // 触发点击
        document.body.appendChild(eleLink);
        eleLink.click();
        // 然后移除
        document.body.removeChild(eleLink);
    }
}
