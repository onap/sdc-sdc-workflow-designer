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
import { DataService } from "./data/data.service";
import { Observable } from "rxjs/Observable";
import { PlanModel } from "../model/plan-model";
import { BroadcastService } from "./broadcast.service";

/**
 * ModelService
 * provides all operations about plan model.
 */
@Injectable()
export class WorkflowService {

    public workflows = new Map<string, any>();
    public planModel: PlanModel;
    private planName : string;

    constructor(private broadcastService: BroadcastService, private dataAccessService: DataService) {
        this.broadcastService.workflows$.subscribe(workflows => this.workflows = workflows);
        this.broadcastService.planModel$.subscribe(workflow => this.planModel = workflow);
    }

    public save() {
        console.log(this.planModel);
        console.log(JSON.stringify(this.planModel));
        this.broadcastService.broadcast(this.broadcastService.saveEvent, {"name": this.planName, "planModel": this.planModel});
    }

    public getPlanName(planId: string): string {
        const planInfo = this.workflows.get(planId);
        return planInfo ? planInfo.planName: null;
    }

    public getPlanModel(planId: string): PlanModel {
        const planInfo = this.workflows.get(planId);
        return planInfo ? planInfo.plan: null;
    }

    public getWorkflows(): Map<string, any> {

        return this.workflows;
    }

    public addWorkflow() {
        this.workflows.set(this.getPlanId(), {"planName": "newPlan", "plan": new PlanModel()});
        this.broadcastWorkflows();
    }

    public deleteWorkflow(planId: string): PlanModel {
        this.workflows.delete(planId);
        this.broadcastWorkflows();

        return undefined;
    }

    public broadcastWorkflows() {
        this.broadcastService.broadcast(this.broadcastService.workflows, this.workflows);
    }

    private getPlanId(): string {
        for(let index=0; index <= this.workflows.size; index++) {
            if(!this.workflows.has(index + "")) {
                return index + "";
            }
        }
    }
}
