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

import { RestConfig } from '../../../../model/rest-config';

/**
 * toolbar component contains some basic operations(save) and all of the supported workflow nodes.
 * The supported nodes can be dragged to container component. which will add a new node to the workflow.
 */
@Component({
    selector: 'b4t-microservice-list',
    templateUrl: 'microservice-list.component.html',
})
export class MicroserviceListComponent {
    @Input() microservices: RestConfig[];
    @Output() microserviceSelected = new EventEmitter<RestConfig>();

    public onMicroserviceSelected(microservice: RestConfig) {
        this.microserviceSelected.emit(microservice);
    }

    public addMicroservice() {
        const microservice = new RestConfig(this.getConfigId(), 'new microservice', '', null);
        this.microservices.push(microservice);

        this.onMicroserviceSelected(microservice);
    }

    public deleteMicroservice(index: number, microservice: RestConfig) {
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

    private getConfigId(): string {
        const idSet = new Set<string>();
        this.microservices.forEach(config => {
            idSet.add(config.id);
        });

        for(let index = 0; index < idSet.size; index++) {
            const id = `config${index}`;
            if(!idSet.has(id)) {
                return id;
            }
        }

        return `config0`;
    }
}
