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

import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { WorkflowService } from "../../../services/workflow.service";
import { Workflow } from "../../../model/workflow/workflow";

/**
 * workflows component
 * open a model to set workflow info
 */
@Component({
    selector: 'b4t-workflows',
    templateUrl: 'workflows.component.html',
})
export class WorkflowsComponent {
    @ViewChild('workflowsModal') public workflowsModal: ModalDirective;

    public workflows: Workflow[];

    constructor(private workflowService: WorkflowService) {
    }

    public show() {
        this.workflows = this.workflowService.getWorkflows();
        this.workflowsModal.show();
    }

    public deleteWorkflow(workflow: Workflow) {
        this.workflowService.deleteWorkflow(workflow.name);
    }

    public addWorkflow() {
        this.workflowService.addWorkflow();
    }

}
