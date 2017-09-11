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
import { BroadcastService } from "./broadcast.service";
import { Subscription } from 'rxjs/Subscription';
import { WorkflowNode } from "../model/workflow/workflow-node";

/**
 * JsPlumbService
 * provides all of the operations about jsplumb plugin.
 */
@Injectable()
export class JsPlumbService {
    public jsplumbInstance;
    public subscriptionMap = new Map<string, Subscription>();

    constructor(private processService: WorkflowProcessService, private broadcastService: BroadcastService) {
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

            this.subscribe4Connection(info.connection);

            info.connection.bind('click', connection => {
                const sequenceFlow = this.processService.getSequenceFlow(connection.sourceId, connection.targetId);
                this.broadcastService.broadcast(this.broadcastService.currentSequenceFlow, sequenceFlow);
                this.broadcastService.broadcast(this.broadcastService.currentType, 'SequenceFlow');
            });

            info.connection.bind('dblclick', connection => {
                const sequenceFlow = this.processService.getSequenceFlow(connection.sourceId, connection.targetId);
                this.broadcastService.broadcast(this.broadcastService.sequenceFlow, sequenceFlow);
                this.broadcastService.broadcast(this.broadcastService.showSequenceFlow, true);
            });
        });

    }

    private subscribe4Connection(connection: any) {
        const pre = connection.sourceId + connection.targetId;
        let sequenceFlowSubscription = this.subscriptionMap.get(pre + 'sequenceFlowSubscription');
        if (sequenceFlowSubscription && !sequenceFlowSubscription.closed) {
            sequenceFlowSubscription.unsubscribe();
        }

        sequenceFlowSubscription = this.broadcastService.currentSequenceFlow$.subscribe(currentSequenceFlow => {
            if (currentSequenceFlow.sourceRef === connection.sourceId
                && currentSequenceFlow.targetRef === connection.targetId) {
                connection.setPaintStyle({ stroke: 'red' });
            } else {
                connection.setPaintStyle({ stroke: 'black' });
            }
        });

        this.subscriptionMap.set(pre + 'sequenceFlowSubscription', sequenceFlowSubscription);

        let typeSubscription = this.subscriptionMap.get(pre + 'typeSubscription');
        if (typeSubscription && !typeSubscription.closed) {
            typeSubscription.unsubscribe();
        }
        typeSubscription = this.broadcastService.currentType$.subscribe(type => {
            if (type === 'WorkflowNode') {
                connection.setPaintStyle({ stroke: 'black' });
            }
        });
        this.subscriptionMap.set(pre + 'typeSubscription', typeSubscription);
    }

    private unsubscription4Connection(connectionSelection: any) {
        connectionSelection.each(connection => {
            const pre = connection.sourceId + connection.targetId;
            this.subscriptionMap.get(pre + 'sequenceFlowSubscription').unsubscribe();
            this.subscriptionMap.get(pre + 'typeSubscription').unsubscribe();
        });
    }

    public initNode(selectorString: string) {
        const selector = this.jsplumbInstance.getSelector(selectorString);

        this.jsplumbInstance.draggable(selector, {
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

    public connectNodes() {
        const nodes: WorkflowNode[] = this.processService.getProcess();
        nodes.forEach(node => this.connect4OneNode(node));
    }

    public connect4OneNode(node: WorkflowNode) {
        node.sequenceFlows.forEach(sequenceFlow => {
            const connection = this.jsplumbInstance.connect({
                source: sequenceFlow.sourceRef,
                target: sequenceFlow.targetRef,
            });
            if (sequenceFlow.condition) {
                connection.setLabel(sequenceFlow.condition);
            }
        });
    }

    public setLabel(sourceId: string, targetId: string, label: string) {
        const sourceNode = this.processService.getNodeById(sourceId);
        const connections = this.jsplumbInstance.select({ source: sourceId, target: targetId });
        connections.setLabel(label);
    }

    public deleteConnect(sourceId: string, targetId: string) {
        const sourceNode = this.processService.getNodeById(sourceId);
        const connectionSelection = this.jsplumbInstance.select({ source: sourceId, target: targetId });
        this.unsubscription4Connection(connectionSelection);
        connectionSelection.delete();
    }

    public remove(nodeId: string) {
        // unsubscription4Connection
        const connectionsAsSource = this.jsplumbInstance.select({ source: nodeId });
        this.unsubscription4Connection(connectionsAsSource);
        const connectionsAsTarget = this.jsplumbInstance.select({ target: nodeId });
        this.unsubscription4Connection(connectionsAsTarget);

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
