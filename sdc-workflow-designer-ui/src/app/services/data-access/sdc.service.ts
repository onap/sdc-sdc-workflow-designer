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
import { CatalogService } from "./catalog.service";
import { Observable } from "rxjs/Observable";
import { WorkflowNode } from "../../model/workflow/workflow-node";
import { HttpService } from "../../util/http.service";
import { PlanModel } from "../../model/workflow/plan-model";

/**
 * SdcService
 * provides data access from sdc
 */
@Injectable()
export class SdcService extends CatalogService {

    constructor(protected httpService: HttpService) {
        super(httpService);
    }

    public loadWorkflows(): Observable<Map<string, PlanModel>> {
        // TODO load data from sdc
        const url = 'api/workflows';
        return this.httpService.get(url).map(response => response.data);
    }

    public loadWorkflow(workflowId: string): Observable<PlanModel> {
        // TODO load data from sdc
        const url = `api/workflows/${workflowId}`;
        return this.httpService.get(url).map(response => response.data as PlanModel);
    }

    public saveWorkflow(name: string, workflow: PlanModel): Observable<boolean> {
        // TODO save workflow design to sdc
        const url = `api/workflows/${name}`;
        return this.httpService.put(url, JSON.stringify(workflow)).map(() => true);
    }

}
