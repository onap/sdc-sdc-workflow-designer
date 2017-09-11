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

import { Component, AfterViewInit, Input, OnDestroy } from '@angular/core';

import { JsPlumbService } from '../../services/jsplumb.service';
import { BroadcastService } from "../../services/broadcast.service";
import { WorkflowNode } from "../../model/workflow/workflow-node";
import { Subscription } from "rxjs/Subscription";

/**
 * workflow node component
 */
@Component({
    selector: 'b4t-node',
    styleUrls: ['./node.component.css'],
    templateUrl: 'node.component.html',
})
export class NodeComponent implements AfterViewInit, OnDestroy {

    @Input() public node: WorkflowNode;
    @Input() public last: boolean;

    public active = false;
    private currentTypeSubscription: Subscription;
    private currentWorkflowSubscription: Subscription;

    constructor(private broadcastService: BroadcastService,
        private jsPlumbService: JsPlumbService) {

    }

    ngAfterViewInit(): void {
        if(this.last) {
            this.jsPlumbService.initNode('.node');
            this.jsPlumbService.connectNodes();
        }

        this.currentTypeSubscription = this.broadcastService.currentType$.subscribe(type => {
            if (type === 'SequenceFlow') {
                this.active = false;
            }
        });

        this.currentWorkflowSubscription = this.broadcastService.currentWorkflowNode$.subscribe(activeNode => {
            if (activeNode.id === this.node.id) {
                this.active = true;
            } else {
                this.active = false;
            }
        });
    }

    public ngOnDestroy() {
        this.currentTypeSubscription.unsubscribe();
        this.currentWorkflowSubscription.unsubscribe();
    }

    public showProperties() {
        this.broadcastService.broadcast(this.broadcastService.nodeProperty, this.node);
        this.broadcastService.broadcast(this.broadcastService.showProperty, true);
    }

    public getDisplayName(): string {
        if (this.node.type === 'restTask' || this.node.type === 'toscaTask') {
            return this.node.name;
        } else {
            return '     ';
        }
    }

    public onSelected() {
        this.broadcastService.broadcast(this.broadcastService.currentWorkflowNode, this.node);
        this.broadcastService.broadcast(this.broadcastService.currentType, 'WorkflowNode');
    }

}
