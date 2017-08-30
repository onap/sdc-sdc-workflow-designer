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

import { Component, AfterViewInit, OnInit } from '@angular/core';
import { JsPlumbService } from "./services/jsplumb.service";
import { WorkflowService } from "./services/workflow.service";
import { WorkflowNode } from "./model/workflow-node";
import { Workflow } from "./model/workflow";
import { DataAccessService } from "./services/data-access/data-access.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

}
