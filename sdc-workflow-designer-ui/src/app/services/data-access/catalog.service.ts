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
import { WorkflowNode } from "../../model/workflow/workflow-node";
import { Observable } from "rxjs/Observable";
import { HttpService } from "../../util/http.service";
import { PlanModel } from "../../model/workflow/plan-model";

/**
 * CatalogService
 * provides data access from backend
 */
@Injectable()
export abstract class CatalogService {

    constructor(protected httpService: HttpService) {}

    public abstract loadWorkflow(workflowId: string): Observable<PlanModel>;
    public abstract loadWorkflows(): Observable<Map<string, PlanModel>>;

    public abstract saveWorkflow(name: string, workflow: PlanModel): Observable<boolean>;
}
