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

import { RestService } from '../../../services/rest.service';
import { RestConfigListComponent } from './rest-config-list/rest-config-list.component';

/**
 * toolbar component contains some basic operations(save) and all of the supported workflow nodes.
 * The supported nodes can be dragged to container component. which will add a new node to the workflow.
 */
@Component({
    selector: 'b4t-rest-config',
    templateUrl: 'rest-config.component.html',
})
export class RestConfigComponent {
    @ViewChild('restConfigModal') public restConfigModal: ModalDirective;

    public currentRestConfig: any = {};

    constructor() {
    }

    public configSelected(restConfig: any) {
        this.currentRestConfig = restConfig;
    }

    public show() {
        this.restConfigModal.show();
    }

}
