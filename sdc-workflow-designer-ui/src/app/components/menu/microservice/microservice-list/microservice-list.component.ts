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

import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { Microservice } from '../../../../model/workflow/microservice';

/**
 * toolbar component contains some basic operations(save) and all of the supported workflow nodes.
 * The supported nodes can be dragged to container component. which will add a new node to the workflow.
 */
@Component({
    selector: 'b4t-microservice-list',
    templateUrl: 'microservice-list.component.html',
})
export class MicroserviceListComponent {
    @Input() microservices: Microservice[];
    @Output() microserviceSelected = new EventEmitter<Microservice>();

    public onMicroserviceSelected(microservice: Microservice) {
        this.microserviceSelected.emit(microservice);
    }

    public addMicroservice() {
        const microservice = new Microservice('new microservice', '', {});
        this.microservices.push(microservice);

        this.onMicroserviceSelected(microservice);
    }

    public deleteMicroservice(index: number, microservice: Microservice) {
        this.deleteMicroService(microservice.name, microservice.version);

        // set the next microservice selected
        let selectedMicroservice;
        if (this.microservices.length > 0) {
            if (this.microservices[index]) {
                selectedMicroservice = this.microservices[index];
            } else {
                selectedMicroservice = this.microservices[index - 1];
            }
        }
        this.onMicroserviceSelected(selectedMicroservice);
    }

    private deleteMicroService(name: string, version: string) {
        const index = this.microservices.findIndex(service => (service.name === name && service.version === version));
        if(index !== -1) {
            return this.microservices.splice(index, 1)[0];
        }

        return undefined;
    }
}
