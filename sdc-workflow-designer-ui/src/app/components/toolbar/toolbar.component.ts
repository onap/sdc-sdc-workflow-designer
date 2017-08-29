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

import { AfterViewInit, Component } from '@angular/core';

import { JsPlumbService } from '../../services/jsplumb.service';

/**
 * toolbar component contains some basic operations(save) and all of the supported workflow nodes.
 * The supported nodes can be dragged to container component. which will add a new node to the workflow.
 */
@Component({
    selector: 'b4t-toolbar',
    templateUrl: 'toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements AfterViewInit {

    constructor(private jsPlumbService: JsPlumbService) {
    }

    public ngAfterViewInit() {
        this.jsPlumbService.buttonDraggable();
    }

}
