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

/**
 * WorkflowService
 * provides all of the operations about workflow operations.
 */
@Injectable()
export class WorkflowService {

    public workflow: Workflow;

    constructor(private dataAccessService: DataAccessService) {

    }

    public save(): Observable<boolean> {
        console.log(this.workflow);
        return this.dataAccessService.catalogService.saveWorkflow(this.workflow);
    }
}
