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

@Component({
    selector: 'b4t-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent {
    @ViewChild(MicroserviceComponent) public microserviceComponent: MicroserviceComponent;

    constructor(private workflowService: WorkflowService) { }

    public save(): void {
        this.workflowService.save();
    }

    public showMicroserviceModal(): void {
        this.microserviceComponent.show();
    }

    public test() {
    }
}
