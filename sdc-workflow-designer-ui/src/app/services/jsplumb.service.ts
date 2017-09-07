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
import * as jsp from 'jsplumb';
import { WorkflowProcessService } from "./workflow-process.service";

/**
 * JsPlumbService
 * provides all of the operations about jsplumb plugin.
 */
@Injectable()
export class JsPlumbService {
    public jsplumbInstance;

    constructor(private processService: WorkflowProcessService) {
        this.initJsPlumbInstance();
    }


    public initJsPlumbInstance() {
        this.jsplumbInstance = jsp.jsPlumb.getInstance({
            Container: 'canvas'
        });

        this.jsplumbInstance.importDefaults({
            Anchor: ['Top', 'RightMiddle', 'LeftMiddle', 'Bottom'],
            Connector: [
                'Flowchart',
                { cornerRadius: 0, stub: 0, gap: 3 },
            ],
            ConnectionOverlays: [
                [
                    'Arrow',
                    { direction: 1, foldback: 1, location: 1, width: 10, length: 10 },
                ],
                ['Label', { label: '', id: 'label', cssClass: 'aLabel' }],
            ],
            Endpoint: 'Blank',
            PaintStyle: {
                strokeWidth: 4,
                stroke: 'black',
            },
            HoverPaintStyle: {
                strokeWidth: 4,
                stroke: 'blue',
            },
        });

        // add connection to model data while a new connection is build
        this.jsplumbInstance.bind('connection', info => {
            this.processService.addSequenceFlow(info.connection.sourceId, info.connection.targetId);

            info.connection.bind('click', connection => {
                this.jsplumbInstance.select({ connections: [connection] }).delete();
                this.processService.deleteSequenceFlow(connection.sourceId, connection.targetId);
            });
        });

    }

    public initNode(selectorString: string) {
        const selector = this.jsplumbInstance.getSelector(selectorString);

        this.jsplumbInstance.draggable(selector, {
            // stop(event) {
            //     node.position.left = event.pos[0];
            //     node.position.top = event.pos[1];
            // },
        });

        this.jsplumbInstance.makeTarget(selector, {
            detachable: false,
            isTarget: true,
            maxConnections: -1,
        });

        this.jsplumbInstance.makeSource(selector, {
            filter: '.anchor, .anchor *',
            detachable: false,
            isSource: true,
            maxConnections: -1,
        });

    }

    public remove(nodeId: string) {
        this.jsplumbInstance.remove(nodeId);
    }

    public buttonDraggable() {
        const selector = this.jsplumbInstance.getSelector('.toolbar .item');
        this.jsplumbInstance.draggable(selector,
            {
                scope: 'btn',
                clone: true,
            });
    }

    public buttonDroppable() {
        const selector = this.jsplumbInstance.getSelector('.canvas');
        this.jsplumbInstance.droppable(selector, {
            scope: 'btn',
            drop: event => {
                const el = this.jsplumbInstance.getSelector(event.drag.el);
                const type = el.attributes.nodeType.value;
                // Mouse position minus drop canvas start position and minus icon half size
                const left = event.e.clientX - 220 - (event.e.offsetX / 2);
                const top = event.e.clientY - 70 - (event.e.offsetY / 2);

                this.processService.addNode(type, type, top, left);
            },
        });
    }

}
