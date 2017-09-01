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

import { MicroserviceListComponent } from './microservice-list/microservice-list.component';
import { Microservice } from "../../../model/workflow/microservice";
import { WorkflowConfigService } from "../../../services/workflow-config.service";

/**
 * microservice component
 * open a model to set microservice info
 */
@Component({
    selector: 'b4t-microservice',
    templateUrl: 'microservice.component.html',
})
export class MicroserviceComponent {
    @ViewChild('microserviceModal') public microserviceModal: ModalDirective;

    public microservices: Microservice[];
    public currentMicroservice: Microservice;

    constructor(private workflowConfigService: WorkflowConfigService) {
    }

    public microserviceSelected(microservice: any) {
        this.currentMicroservice = microservice;
    }

    public show() {
        this.microservices = this.workflowConfigService.getMicroservices();
        this.microserviceModal.show();
    }

}
