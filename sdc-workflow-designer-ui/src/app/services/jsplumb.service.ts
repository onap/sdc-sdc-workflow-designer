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

import { Subscription } from 'rxjs/Subscription';
import { WorkflowNode } from '../model/workflow/workflow-node';
import { BroadcastService } from './broadcast.service';
import { ModelService } from './model.service';
import { SequenceFlow } from '../model/workflow/sequence-flow';
import { Position } from '../model/workflow/position';

/**
 * JsPlumbService
 * provides all of the operations about jsplumb plugin.
 */
@Injectable()
export class JsPlumbService {
    public jsplumbInstanceMap = new Map<string, any>();
    public subscriptionMap = new Map<string, Subscription>();

    private padding = 20;
    private rootClass = 'canvas';
    private selectNodes: WorkflowNode[] = [];

    constructor(private modelService: ModelService, private broadcastService: BroadcastService) {

        this.broadcastService.selectedElement$.subscribe(elements => {
            this.selectNodes = [];
            if (elements && 0 < elements.length) {
                for (let index = 0; index < elements.length; index++) {
                    let element = elements[index];
                    if (this.modelService.isNode(element)) {
                        let node = element as WorkflowNode;
                        this.selectNodes.push(node);
                    }
                }
            }
        });
    }

    public connectChildrenNodes(parentNodeId: string) {
        const jsplumbInstance = this.jsplumbInstanceMap.get(parentNodeId);

        const nodes: WorkflowNode[] = this.modelService.getChildrenNodes(parentNodeId);
        nodes.forEach(node => this.connect4OneNode(node, jsplumbInstance));
    }

    public connect4OneNode(node: WorkflowNode, jsplumbInstance: any) {
        node.connection.forEach(sequenceFlow => {
            const connection = jsplumbInstance.connect({
                source: sequenceFlow.sourceRef,
                target: sequenceFlow.targetRef,
            });
            if (sequenceFlow.name) {
                connection.setLabel(sequenceFlow.name);
            }
        });
    }

    public initJsPlumbInstance(id: string) {
        if (this.jsplumbInstanceMap.get(id)) {
            return;
        }
        const jsplumbInstance = jsp.jsPlumb.getInstance();

        jsplumbInstance.importDefaults({
            Anchor: "Continuous",
            Endpoint: "Blank",
            Container: "pallete",
            ReattachConnections: true,
            Connector: ['Flowchart', {
                stub: [0, 0],
                cornerRadius: 5,
                alwaysRespectStubs: true
            }],
            PaintStyle: {
                stroke: "#7D8695",
                strokeWidth: 1,
                radius: 1,
                outlineStroke: "transform",
                outlineWidth: 4
            },
            ConnectorStyle: {
                stroke: "#7D8695",
                strokeWidth: 1,
                outlineStroke: "transform",
                outlineWidth: 4
            },
            ConnectorHoverStyle: {
                stroke: "#00ABFF",
                strokeWidth: 2,
                outlineStroke: "transform",
                outlineWidth: 4
            },
            ConnectionOverlays: [
                ['Arrow', {
                    location: 1,
                    id: 'arrow',
                    cssClass: 'icon-port',
                    width: 11,
                    length: 12
                }],
                ['Label', { label: '', id: 'label' }]
            ]
        });

        // add connection to model data while a new connection is build
        jsplumbInstance.bind('connection', info => {
            this.modelService.addConnection(info.connection.sourceId, info.connection.targetId);

            this.subscribe4Connection(info.connection);

            info.connection.bind('click', (connection, event) => {
                if ('Label' === connection.type) {
                    return;
                }
                event.stopPropagation();
                const sequenceFlow = this.modelService.getSequenceFlow(connection.sourceId, connection.targetId);
                this.broadcastService.broadcast(this.broadcastService.showProperty, null);
                this.broadcastService.broadcast(this.broadcastService.selectedElement, [sequenceFlow]);
            });

            info.connection.bind('dblclick', connection => {
                if ('Label' === connection.type) {
                    return;
                }
                const sequenceFlow = this.modelService.getSequenceFlow(connection.sourceId, connection.targetId);
                this.broadcastService.broadcast(this.broadcastService.showProperty, sequenceFlow);
            });
        });

        this.jsplumbInstanceMap.set(id, jsplumbInstance);
    }

    private subscribe4Connection(connection: any) {
        const pre = connection.sourceId + connection.targetId;
        let sequenceFlowSubscription = this.subscriptionMap.get(pre + 'sequenceFlowSubscription');
        if (sequenceFlowSubscription && !sequenceFlowSubscription.closed) {
            sequenceFlowSubscription.unsubscribe();
        }

        let currentThis = this;
        sequenceFlowSubscription = this.broadcastService.selectedElement$.subscribe(elements => {
            let selected = false;
            if (elements && 0 < elements.length) {
                for (let index = 0; index < elements.length; index++) {
                    let element = elements[index];
                    if (!this.modelService.isNode(element)) {
                        let sequence = element as SequenceFlow;
                        if (sequence.sourceRef === connection.sourceId
                            && sequence.targetRef === connection.targetId) {
                            selected = true;
                        }
                    }
                }
            }
            if (selected) {
                connection.setPaintStyle({
                    stroke: '#00ABFF',
                    strokeWidth: 1,
                    radius: 1,
                    outlineStroke: "transform",
                    outlineWidth: 4
                });
            } else {
                connection.setPaintStyle({
                    stroke: '#7D8695',
                    strokeWidth: 1,
                    radius: 1,
                    outlineStroke: "transform",
                    outlineWidth: 4
                });
            }
        });
        this.subscriptionMap.set(pre + 'sequenceFlowSubscription', sequenceFlowSubscription);
    }

    private unsubscription4Connection(connectionSelection: any) {
        connectionSelection.each(connection => {
            const pre = connection.sourceId + connection.targetId;
            this.subscriptionMap.get(pre + 'sequenceFlowSubscription').unsubscribe();
        });
    }

    public deleteConnect(sourceId: string, targetId: string) {
        const sourceNode = this.modelService.getNodeMap().get(sourceId);
        const jsplumbInstance = this.jsplumbInstanceMap.get(sourceNode.parentId);
        const connectionSelection = jsplumbInstance.select({ source: sourceId, target: targetId });
        this.unsubscription4Connection(connectionSelection);
        connectionSelection.delete();
    }

    public setLabel(sourceId: string, targetId: string, label: string) {
        const sourceNode = this.modelService.getNodeMap().get(sourceId);
        const jsplumbInstance = this.jsplumbInstanceMap.get(sourceNode.parentId);
        const connections = jsplumbInstance.select({ source: sourceId, target: targetId });
        connections.setLabel(label);
    }

    public getParentNodeId(id: string): string {
        const nodeElement = jsp.jsPlumb.getSelector('#' + id);
        const parentNode = this.getParentNodeEl(nodeElement[0]);

        return parentNode ? parentNode.id : null;
    }

    public initNode(node: WorkflowNode) {
        const jsplumbInstance = this.jsplumbInstanceMap.get(node.parentId);

        this.jsplumbInstanceMap.get(this.modelService.rootNodeId).draggable(node.id, {
            scope: 'node',
            filter: '.ui-resizable-handle',
            classes: {
                'ui-draggable': 'dragging'
            },
            // grid: [5, 5],
            drag: event => {
                // out of container edge, reset to minimal value.
                if (0 > event.pos[0]) {
                    event.el.style.left = '0px';
                }
                if (0 > event.pos[1]) {
                    event.el.style.top = '0px';
                }

                if (0 < this.selectNodes.length) {
                    let moveAll = false;
                    this.selectNodes.forEach(element => {
                        if (element.id === event.el.id) {
                            moveAll = true;
                        }
                    });
                    if (moveAll) {
                        this.selectNodes.forEach(selectNode => {
                            if (selectNode.id !== event.el.id) {
                                selectNode.position.left += event.e.movementX;
                                selectNode.position.left = 0 > selectNode.position.left ? 0 : selectNode.position.left;
                                selectNode.position.top += event.e.movementY;
                                selectNode.position.top = 0 > selectNode.position.top ? 0 : selectNode.position.top;
                            }
                            jsplumbInstance.revalidate(jsplumbInstance.getSelector('#' + selectNode.id));
                        });
                    }
                }
            },
            stop: event => {
                this.selectNodes.forEach(selectNode => {
                    jsplumbInstance.revalidate(jsplumbInstance.getSelector('#' + selectNode.id));
                });
            }
        });

        jsplumbInstance.makeTarget(node.id, {
            maxConnections: -1,
            beforeDrop: function (info) {
                const sourceId = info.sourceId;
                const targetId = info.targetId;
                if (sourceId === targetId) {
                    return false;
                }
                const sameConnections = this.instance.getConnections({ source: sourceId, target: targetId });
                if (sameConnections && 0 < sameConnections.length) {
                    return false;
                }
                return true;
            }

        });

        jsplumbInstance.makeSource(node.id, {
            filter: '.anchor, .anchor *',
            maxConnections: -1,
        });
    }

    public nodeDroppable(node: WorkflowNode, rank: number) {
        const jsplumbInstance = this.jsplumbInstanceMap.get(node.parentId);

        const selector = jsplumbInstance.getSelector('#' + node.id);
        this.jsplumbInstanceMap.get(this.modelService.rootNodeId).droppable(selector, {
            scope: 'node',
            rank,
            tolerance: 'pointer',
            drop: event => {
                if (!this.isChildNode(event.drop.el, event.drag.el)) {
                    this.drop(event);
                }
                return true;
            },
            canDrop: drag => {
                const nodeMap = this.modelService.getNodeMap();
                const ancestorNode = nodeMap.get(drag.el.id);

                const isAncestor = this.modelService.isDescendantNode(ancestorNode, node.id);
                return !isAncestor;
            },
        });
    }

    private isChildNode(childElement, parentElement) {
        while (childElement !== parentElement) {
            childElement = childElement.parentNode;
            if (childElement.classList.contains('canvas')) {
                return false;
            }
        }

        return true;
    }

    private drop(event) {
        const dragEl = event.drag.el;
        const dropEl = event.drop.el;

        this.resizeParent(dragEl, dropEl);

        const nodeLeft = dragEl.getBoundingClientRect().left;
        const nodeTop = dragEl.getBoundingClientRect().top;
        const parentLeft = dropEl.getBoundingClientRect().left;
        const parentTop = dropEl.getBoundingClientRect().top;
        const left = nodeLeft - parentLeft + dropEl.scrollLeft;
        const top = nodeTop - parentTop + dropEl.scrollTop;
        dragEl.style.top = top + 'px';
        dragEl.style.left = left + 'px';

        // 12 is title height
        this.modelService.updatePosition(dragEl.id, left, top, dragEl.getBoundingClientRect().width, dragEl.getBoundingClientRect().height - 12);

        const originalParentNode = this.getParentNodeEl(dragEl);
        const originalParentNodeId = originalParentNode ? originalParentNode.id : this.modelService.rootNodeId;

        const targetParentNodeId = dropEl.classList.contains('node') ? dropEl.id : this.modelService.rootNodeId;
        this.changeParent(dragEl.id, originalParentNodeId, targetParentNodeId);
    }

    private changeParent(id: string, originalParentNodeId: string, targetParentNodeId: string) {
        if (originalParentNodeId !== targetParentNodeId) {
            this.jsplumbInstanceMap.get(originalParentNodeId).removeAllEndpoints(id);
            this.modelService.changeParent(id, originalParentNodeId, targetParentNodeId);
        }
    }

    private getParentNodeEl(element) {
        while (!(element.parentNode.classList.contains('node') || element.parentNode.classList.contains('canvas'))) {
            element = element.parentNode;
        }

        if (element.parentNode.classList.contains('canvas')) { // top level node
            return null;
        } else {
            return element.parentNode;
        }
    }

    public canvasDroppable() {
        const jsplumbInstance = this.jsplumbInstanceMap.get(this.modelService.rootNodeId);
        const canvasSelector = jsplumbInstance.getSelector('.canvas');
        jsplumbInstance.droppable(canvasSelector, {
            scope: 'node',
            rank: 0,
            grid: [5, 5],
            drop: event => this.drop(event),
        });
    }

    public buttonDraggable() {
        const jsplumbInstance = this.jsplumbInstanceMap.get(this.modelService.rootNodeId);
        const selector = jsplumbInstance.getSelector('.item');
        jsplumbInstance.draggable(selector, {
            scope: 'btn',
            clone: true
        });
    }

    public buttonDroppable() {
        const jsplumbInstance = this.jsplumbInstanceMap.get(this.modelService.rootNodeId);
        const selector = jsplumbInstance.getSelector('.canvas');
        jsplumbInstance.droppable(selector, {
            scope: 'btn',
            // grid: [5, 5],
            drop: event => {
                const el = jsplumbInstance.getSelector(event.drag.el);
                const type = el.attributes.nodeType.value;
                // Mouse position minus drop canvas start position plus scroll position.
                let left = event.e.x - event.drop.pagePosition[0] + event.drop.el.scrollLeft;
                let top = event.e.y - event.drop.pagePosition[1] + event.drop.el.scrollTop;
                if (0 > left) {
                    left = 0;
                }
                if (0 > top) {
                    top = 0;
                }
                const name = event.drag.el.children[1].innerText;
                this.modelService.addNode(name, type, left, top);
            },
        });
    }

    public remove(node: WorkflowNode) {
        const jsplumbInstance = this.jsplumbInstanceMap.get(node.parentId);

        // unsubscription4Connection
        const connectionsAsSource = jsplumbInstance.select({ source: node.id });
        this.unsubscription4Connection(connectionsAsSource);
        const connectionsAsTarget = jsplumbInstance.select({ target: node.id });
        this.unsubscription4Connection(connectionsAsTarget);

        jsplumbInstance.remove(node.id);
    }

    public resizeParent(element: any, parentElement: any) {
        if (parentElement.classList.contains(this.rootClass)) {
            return;
        }

        if (!parentElement.classList.contains('node')) {
            this.resizeParent(element, parentElement.parentNode);
            return;
        }

        const leftResized = this.resizeParentLeft(element, parentElement);
        const rightResized = this.resizeParentRight(element, parentElement);
        const topResized = this.resizeParentTop(element, parentElement);
        const bottomResized = this.resizeParentBottom(element, parentElement);

        if (leftResized || rightResized || topResized || bottomResized) {
            if (parentElement.classList.contains('node')) {
                const rect = parentElement.getBoundingClientRect();
                this.modelService.updatePosition(parentElement.id,
                    parentElement.offsetLeft,
                    parentElement.offsetTop,
                    // title height
                    rect.width, rect.height - 12);
            }
            this.resizeParent(parentElement, parentElement.parentNode);
        }
    }

    private resizeParentLeft(element: any, parentElement: any): boolean {
        let resized = false;

        const actualLeft = element.getBoundingClientRect().left;
        const actualParentLeft = parentElement.getBoundingClientRect().left;

        if (actualLeft - this.padding < actualParentLeft) {
            const width = actualParentLeft - actualLeft + this.padding;

            this.translateElement(parentElement, -width, 0, width, 0);
            this.translateChildren(parentElement, element, width, 0);
            resized = true;
        }

        return resized;
    }

    private resizeParentRight(element: any, parentElement: any): boolean {
        let resized = false;

        const actualLeft = element.getBoundingClientRect().left;
        const actualRight = actualLeft + element.offsetWidth;

        const actualParentLeft = parentElement.getBoundingClientRect().left;

        if ((actualParentLeft + parentElement.offsetWidth) < actualRight + this.padding) {
            this.setElementWidth(parentElement, actualRight + this.padding - actualParentLeft);
            resized = true;
        }

        return resized;
    }

    private resizeParentBottom(element: any, parentElement: any): boolean {
        let resized = false;

        const actualTop = element.getBoundingClientRect().top;
        const actualBottom = actualTop + element.offsetHeight;

        const actualParentTop = parentElement.getBoundingClientRect().top;
        const actualParentBottom = actualParentTop + parentElement.offsetHeight;

        if (actualParentBottom < actualBottom + this.padding) {
            this.setElementHeight(parentElement, actualBottom + this.padding - actualParentTop);
            resized = true;
        }

        return resized;
    }

    private resizeParentTop(element: any, parentElement: any): boolean {
        let resized = false;

        const actualTop = element.getBoundingClientRect().top;
        const actualParentTop = parentElement.getBoundingClientRect().top;

        if (actualTop - this.padding < actualParentTop) {
            const height = actualParentTop - actualTop + this.padding;

            this.translateElement(parentElement, 0, -height, 0, height);
            this.translateChildren(parentElement, element, 0, height);
            resized = true;
        }

        return resized;
    }

    private translateElement(element, left: number, top: number, width: number, height: number) {
        const offsetLeft = element.offsetLeft + left;
        element.style.left = offsetLeft + 'px';

        const offsetTop = element.offsetTop + top;
        element.style.top = offsetTop + 'px';

        const offsetWidth = element.offsetWidth + width;
        element.style.width = offsetWidth + 'px';

        const offsetHeight = element.offsetHeight + height;
        element.style.height = offsetHeight + 'px';

        if (element.classList.contains('node')) {
            const node = this.modelService.getNodeMap().get(element.id);
            this.jsplumbInstanceMap.get(node.parentId).revalidate(element.id);
        }
    }

    private translateChildren(parentElment, excludeElement, left: number, top: number) {
        const len = parentElment.children.length;
        for (let i = 0; i < len; i++) {
            const childElment = parentElment.children[i];
            if (childElment.localName === 'b4t-node') {
                this.translateElement(childElment.children[0], left, top, 0, 0);
            }
        }
    }

    private setElementHeight(element, height: number) {
        element.style.height = height + 'px';
    }

    private setElementWidth(element, width: number) {
        element.style.width = width + 'px';
    }

    private getActualPosition(element, offset: string) {
        let actualPosition = element[offset];
        let current = element.offsetParent;
        while (current !== null) {
            actualPosition += element[offset];
            current = current.offsetParent;
        }
        return actualPosition;
    }
}
