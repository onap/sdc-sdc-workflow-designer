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
import { PlanModel } from "../model/workflow/plan-model";
import { Configs } from "../model/workflow/configs";
import { BroadcastService } from "./broadcast.service";

/**
 * ModelService
 * provides all operations about plan model.
 */
@Injectable()
export class WorkflowService {

    public workflows = new Map<number, any>();
    public planModel: PlanModel;
    private planName : string;
    public workflowIndex = 0;

    constructor(private broadcastService: BroadcastService, private dataAccessService: DataAccessService) {
        this.dataAccessService.catalogService.loadWorkflows().subscribe(workflows => {
            this.workflowIndex = 0;
            for(let key in workflows) {
                this.workflows.set(this.workflowIndex, {
                    "planName": key,
                    "plan": workflows[key]
                });
                this.workflowIndex++ ;
            }
            this.broadcastWorkflows();
        });
        this.broadcastService.workflow.subscribe(workflow => this.planModel = workflow);
    }

    public save(): Observable<boolean> {
        console.log(this.planModel);
        console.log(JSON.stringify(this.planModel));
        return this.dataAccessService.catalogService.saveWorkflow(this.planName, this.planModel);
    }

    public getWorkflows(): Map<number, any> {

        return this.workflows;
    }

    public addWorkflow() {
        this.workflows.set(this.workflowIndex, {"planName": "newPlan", "plan": new PlanModel()});
        this.workflowIndex++;
        this.broadcastWorkflows();
    }

    public deleteWorkflow(planId: number): PlanModel {
        this.workflows.delete(planId);
        this.broadcastWorkflows();

        return undefined;
    }

    public broadcastWorkflows() {
        this.broadcastService.broadcast(this.broadcastService.workflows, this.workflows);
    }
}
