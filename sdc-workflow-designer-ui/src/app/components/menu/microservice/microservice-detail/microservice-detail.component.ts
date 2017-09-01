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

import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { Microservice } from '../../../../model/workflow/microservice';
import { WorkflowConfigService } from '../../../../services/workflow-config.service';

/**
 * toolbar component contains some basic operations(save) and all of the supported workflow nodes.
 * The supported nodes can be dragged to container component. which will add a new node to the workflow.
 */
@Component({
    selector: 'b4t-microservice-detail',
    templateUrl: 'microservice-detail.component.html',
})
export class MicroserviceDetailComponent implements OnChanges {
    @Input() microservice: Microservice;

    public detail: string;

    constructor() {
    }

    public ngOnChanges() {
        if(this.microservice == null) {
            this.microservice = new Microservice('', '', {});
        }
        this.parseSwagger2String();
    }

    private parseSwagger2String() {
        if (this.microservice.swagger) {
            this.detail = JSON.stringify(this.microservice.swagger);
        } else {
            this.detail = '';
        }
    }

    public onDetailChanged(detail: string) {
        try {
            const swagger = JSON.parse(detail);
            this.detail = detail;
            console.log(swagger);
            this.microservice.swagger = swagger;
        } catch (e) {
            // if detail is not a json object, then not change the swagger
        }
    }
}
