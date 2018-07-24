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
import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {WorkflowNode} from "../../model/workflow/workflow-node";
import {BroadcastService} from "../../services/broadcast.service";
import {JsPlumbService} from "../../services/jsplumb.service";
import {NodeType} from "../../model/workflow/node-type.enum";
import {WorkflowUtil} from "../../util/workflow-util";

/**
 * node component represent a single workflow node.
 * every node would be rendered on the container component
 */
@Component({
    selector: 'wfm-node',
    styleUrls: ['./node.component.css'],
    templateUrl: 'node.component.html',
})
export class NodeComponent implements AfterViewInit, OnDestroy {
    @Input() public node: WorkflowNode;
    @Input() public rank: number;
    @ViewChild('nodeItem') nodeItem: ElementRef;

    public nodeType = NodeType;
    public active = false;
    private currentWorkflowSubscription: Subscription;
    private isMoving = false;

    constructor(private jsPlumbService: JsPlumbService,
                private broadcastService: BroadcastService) {
    }

    public ngAfterViewInit() {
        this.jsPlumbService.initJsPlumbInstance(this.node.parentId);
        this.jsPlumbService.initNode(this.node);

        if (this.canHaveChildren()) {
            this.jsPlumbService.nodeDroppable(this.node, this.rank);
            this.jsPlumbService.connectChildrenNodes(this.node.id);
        }

        this.currentWorkflowSubscription = this.broadcastService.selectedElement$.subscribe(activeNodes => {
            let active = false;
            for (let index = 0; index < activeNodes.length; index++) {
                let activeNode = activeNodes[index] as WorkflowNode;
                if (activeNode.id === this.node.id) {
                    active = true;
                    break;
                }
            }
            this.active = active;
        });
    }

    public ngOnDestroy() {
        this.currentWorkflowSubscription.unsubscribe();
        if (this.nodeItem.nativeElement.onmousemove) {
            this.nodeItem.nativeElement.onmousemove = null;
        }
    }

    public onMousedown() {
        let currentThis = this;
        this.nodeItem.nativeElement.onmousemove = function () {
            currentThis.isMoving = true;
        };
    }

    public onClick(event) {
        if (this.nodeItem.nativeElement.onmousemove) {
            this.nodeItem.nativeElement.onmousemove = null;
        }
        if (this.isMoving && this.active) {
            this.isMoving = false;
            return;
        }
        event.stopPropagation();
        this.broadcastService.broadcast(this.broadcastService.showProperty, null);
        this.broadcastService.broadcast(this.broadcastService.selectedElement, [this.node]);
    }

    public canHaveChildren(): boolean {
        return this.node.type === 'subProcess';
    }

    public onMouseOut(event, target) {
        event.stopPropagation();
        target.classList.remove('hover');
    }

    public onMouseOver(event, target) {
        event.stopPropagation();
        target.classList.add('hover');
    }

    public isGatewayNodeType(type: string): boolean {
        if (type === this.nodeType[this.nodeType.exclusiveGateway] || type === this.nodeType[this.nodeType.parallelGateway]) {
            return true;
        }
        return false;
    }

    public showProperties(event) {
        if (this.isGatewayNodeType(this.node.type)) {
            return;
        }
        event.stopPropagation();
        this.broadcastService.broadcast(this.broadcastService.showProperty, this.node);
    }

    public getImageUrl(name: string): string {
        return WorkflowUtil.GetIconFullPath(name);
    }
}
