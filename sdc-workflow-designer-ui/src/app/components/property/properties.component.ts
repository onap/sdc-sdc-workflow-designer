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

import { Node } from '../../model/workflow/node';
import { NodeType } from '../../model/workflow/node-type';
import { BroadcastService } from '../../services/broadcast.service';
import { JsPlumbService } from '../../services/jsplumb.service';
import { ModelService } from '../../services/model.service';

/**
 * property component presents information of a workflow node.
 * the presented information can be edit in this component.
 * it may load information dynamically. the content may be different for different node type.
 */
@Component({
    selector: 'b4t-properties',
    styleUrls: ['./properties.component.css'],
    templateUrl: 'properties.component.html',
})
export class WmPropertiesComponent implements AfterViewInit {
    public node: Node;
    public nodeTypes = NodeType;
    public show = false;
    public titleEditing = false;

    constructor(private broadcastService: BroadcastService,
                private modelService: ModelService,
                private jsPlumnService: JsPlumbService) {

    }

    public ngAfterViewInit() {
        this.broadcastService.showProperty$.subscribe(show => this.show = show);
        this.broadcastService.nodeProperty$.subscribe(node => this.node = node);
    }

    public nodeNameChanged() {
        this.titleEditing = !this.titleEditing;
        this.jsPlumnService.jsplumbInstance.repaintEverything();
    }

    public deleteNode() {
        this.show = false;

        this.jsPlumnService.remove(this.node.id);
        this.modelService.deleteNode(this.node.id);
    }
}
