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
import { Observable } from "rxjs/Observable";
import { WorkflowNode } from "../../model/workflow/workflow-node";
import { HttpService } from "../../util/http.service";
import { PlanModel } from "../../model/plan-model";
import { BackendService } from './backend.service';
import { NodeTemplate } from '../../model/topology/node-template';

/**
 * SdcService
 * provides data access from sdc
 */
@Injectable()
export class SdcService extends BackendService {
    private workflowId: string;

    public getBackendType(): string {
        return "SDC";
    }
    public setParameters(params: any) {
        this.workflowId = params;
        this.loadPlans().subscribe(plans => {
            const map = new Map<string, any>();
            for(let id of Object.keys(plans)) {
                map.set(id, plans[id]);
            }
            this.broadcastService.broadcast(this.broadcastService.workflows, map);
        });
    }
    public loadNodeTemplates(): Observable<NodeTemplate[]> {
        // TODO load data from sdc
        const url = 'api/mockarray';
        return this.httpService.get(url).map(response => response.data);
    }
    public loadTopologyProperties(nodeTemplate: NodeTemplate): Observable<string[]> {
        // TODO load data from sdc
        const url = 'api/mockarray';
        return this.httpService.get(url).map(response => response.data);
    }
    public loadNodeTemplateInterfaces(nodeTemplate: NodeTemplate): Observable<string[]> {
        // TODO load data from sdc
        const url = 'api/mockarray';
        return this.httpService.get(url).map(response => response.data);
    }
    public loadNodeTemplateOperations(nodeTemplate: NodeTemplate, interfaceName: string): Observable<string[]> {
        // TODO load data from sdc
        const url = 'api/mockarray';
        return this.httpService.get(url).map(response => response.data);
    }
    public loadNodeTemplateOperationParameter(nodeTemplate: NodeTemplate, interfaceName: string, operation: string): Observable<any> {
        // TODO load data from sdc
        const url = 'api/mockobject';
        return this.httpService.get(url).map(response => response.data);
    }

    public loadPlans(): Observable<any> {
        // TODO load data from sdc
        const url = 'api/workflows';
        return this.httpService.get(url).map(response => response.data);
    }

    public loadPlan(): Observable<PlanModel> {
        // TODO load data from sdc
        const url = `api/workflows/${this.workflowId}`;
        return this.httpService.get(url).map(response => response.data as PlanModel);
    }

    public save(data: any): Observable<boolean> {
        // TODO save workflow design to sdc
        const url = `api/workflows/${data.name}`;
        return this.httpService.put(url, JSON.stringify(data.planModel)).map(() => true);
    }

}
