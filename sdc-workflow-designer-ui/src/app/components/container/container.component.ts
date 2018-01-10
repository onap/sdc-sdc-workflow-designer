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

import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { SequenceFlow } from '../../model/workflow/sequence-flow';
import { WorkflowElement } from '../../model/workflow/workflow-element';
import { WorkflowNode } from '../../model/workflow/workflow-node';
import { BroadcastService } from '../../services/broadcast.service';
import { JsPlumbService } from '../../services/jsplumb.service';
import { ModelService } from '../../services/model.service';

/**
 * main canvas, it contains two parts: canvas and node property component
 * bpmn task nodes can be dropped into this canvas, and then the workflow can be edit
 */
@Component({
    selector: 'b4t-container',
    templateUrl: 'container.component.html',
    styleUrls: ['./container.component.css']
})
export class ContainerComponent implements AfterViewChecked, AfterViewInit, OnInit, OnDestroy {
    public allNotes: WorkflowNode[];
    @ViewChild('nodeSelector') nodeSelector: ElementRef;
    @ViewChild('mainContainer') mainContainer: ElementRef;

    private isSelecting = false;
    private selectedElements: WorkflowElement[] = [];
    private showProperties = false;
    private needInitSequence = false;

    constructor(private broadcastService: BroadcastService, private jsPlumbService: JsPlumbService,
        public modelService: ModelService) {
    }

    @HostListener('window:keyup.delete', ['$event']) ondelete(event: KeyboardEvent) {
        if (this.showProperties || 0 >= this.selectedElements.length) {
            return;
        }
        this.selectedElements.forEach(element => {
            if (this.modelService.isNode(element)) {
                let selectNode = element as WorkflowNode;
                const parentId = this.jsPlumbService.getParentNodeId(selectNode.id);
                this.jsPlumbService.remove(selectNode);
                this.modelService.deleteNode(parentId, selectNode.id);
            } else {
                let sequenceFlow = element as SequenceFlow;
                this.modelService.deleteConnection(sequenceFlow.sourceRef, sequenceFlow.targetRef);
                this.jsPlumbService.deleteConnect(sequenceFlow.sourceRef, sequenceFlow.targetRef);
            }
        });
        this.selectedElements = [];
    }

    @HostListener('document:mouseup', ['$event']) onmouseup() {
        if (this.isSelecting) {
            this.nodeSelector.nativeElement.style.display = 'none';
            this.mainContainer.nativeElement.onmousemove = null;
            this.isSelecting = false;
            this.broadcastService.broadcast(this.broadcastService.showProperty, null);
            this.broadcastService.broadcast(this.broadcastService.selectedElement, this.selectedElements);
        }
    }

    public ngOnInit() {
        this.jsPlumbService.initJsPlumbInstance(this.modelService.rootNodeId);
        this.broadcastService.planModel$.subscribe(() => {
            this.needInitSequence = true;
        });
        this.broadcastService.showProperty$.subscribe(element=>{
            this.showProperties = null !== element;
        });
    }

    public ngAfterViewInit() {
        this.jsPlumbService.canvasDroppable();
        this.broadcastService.selectedElement$.subscribe(elements => {
            if (elements) {
                this.selectedElements = elements;
            } else {
                this.selectedElements = [];
            }
        });
    }

    public ngAfterViewChecked() {
        if (this.needInitSequence) {
            this.needInitSequence = false;
            // Add the connection
            this.jsPlumbService.connectChildrenNodes(this.modelService.rootNodeId);
        }
    }

    public ngOnDestroy() {
        if (this.mainContainer.nativeElement.onmousemove) {
            this.mainContainer.nativeElement.document.onmousemove = null;
        }
    }

    public canvasMouseDown(event) {
        this.selectedElements = [];
        this.isSelecting = true;
        let posx = event.clientX + this.mainContainer.nativeElement.scrollLeft;
        posx = 220 > posx ? 0 : posx - 220;
        let posy = event.clientY + this.mainContainer.nativeElement.scrollTop;
        posy = 60 > posy ? 0 : posy - 60;
        let element = this.nodeSelector.nativeElement;
        element.style.left = posx + "px";
        element.style.top = posy + "px";
        element.style.width = '0px';
        element.style.height = '0px';
        element.style.display = 'block';
        let curThis = this;
        this.mainContainer.nativeElement.onmousemove = function (moveEvent) {
            let movePosx = moveEvent.clientX + curThis.mainContainer.nativeElement.scrollLeft;
            movePosx = 220 > movePosx ? 0 : movePosx - 220;
            let movePosy = moveEvent.clientY + curThis.mainContainer.nativeElement.scrollTop;
            movePosy = 60 > movePosy ? 0 : movePosy - 60;
            const left = Math.min(movePosx, posx);
            const top = Math.min(movePosy, posy);
            const width = Math.abs(posx - movePosx);
            const height = Math.abs(posy - movePosy);
            element.style.left = left + "px";
            element.style.top = top + "px";
            element.style.width = width + "px";
            element.style.height = height + "px";
            curThis.selectNodes(left, top, width, height);
        };
    }

    private selectNodes(left: number, top: number, width: number, height: number) {
        this.selectedElements = [];
        const allNodes = this.modelService.getNodes();
        allNodes.forEach(node => {
            const np = node.position;
            let selected = false;
            if (left < np.left) {
                if ((top < np.top && left + width > np.left && top + height > np.top)
                    || (top >= np.top && top < np.top + np.height && left + width > np.left)) {
                    selected = true;
                }
            } else if (left < np.left + np.width) {
                if ((top < np.top && top + height > np.top)
                    || (top >= np.top && top < np.top + np.height)) {
                    selected = true;
                }
            }
            if (selected) {
                this.selectedElements.push(node);
            }
        });
        this.broadcastService.broadcast(this.broadcastService.selectedElement, this.selectedElements);
    }

}
