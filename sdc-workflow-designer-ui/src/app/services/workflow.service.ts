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
import { DataAccessService } from "./data-access/data-access.service";
import { Observable } from "rxjs/Observable";
import { Workflow } from "../model/workflow/workflow";
import { Configs } from "../model/workflow/configs";
import { BroadcastService } from "./broadcast.service";

/**
 * WorkflowService
 * provides all of the operations about workflow operations.
 */
@Injectable()
export class WorkflowService {

    public workflows: Workflow[];
    public workflow: Workflow;
    public workflowIndex = 0;

    constructor(private broadcastService: BroadcastService, private dataAccessService: DataAccessService) {
        this.dataAccessService.catalogService.loadWorkflows().subscribe(workflows => {
            this.workflows = workflows;
            this.broadcastWorkflows();
        });
        this.broadcastService.workflow.subscribe(workflow => this.workflow = workflow);
    }

    public save(): Observable<boolean> {
        console.log(this.workflow);
        console.log(JSON.stringify(this.workflow));
        return this.dataAccessService.catalogService.saveWorkflow(this.workflow);
    }

    public getWorkflows(): Workflow[] {
        return this.workflows;
    }

    public addWorkflow() {
        this.workflows.push(new Workflow('wf' + this.workflowIndex, '', [], new Configs([])));
        this.workflowIndex++;
        this.broadcastWorkflows();
    }

    public deleteWorkflow(workflowName: string): Workflow {
        const index = this.workflows.findIndex(workflow => (workflow.name === workflowName));
        if(index !== -1) {
            return this.workflows.splice(index, 1)[0];
        }
        this.broadcastWorkflows();

        return undefined;
    }

    public broadcastWorkflows() {
        this.broadcastService.broadcast(this.broadcastService.workflows, this.workflows);
    }
}
