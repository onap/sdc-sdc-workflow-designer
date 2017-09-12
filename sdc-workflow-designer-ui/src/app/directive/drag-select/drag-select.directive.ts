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

import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import { JsPlumbService } from "../../services/jsplumb.service";

@Directive({
    selector: '[b4tDragSelect]'
})
export class DragSelectDirective implements AfterViewInit {
    private selectBox: any;
    public selecting = false;

    public relatvieX: number;
    public relatvieY: number;

    public startX: number;
    public startY: number;
    public endX: number;
    public endY: number;

    public left: number = 0;
    public top: number = 0;
    public width: number = 0;
    public height: number = 0;

    constructor(private el: ElementRef, private jsPlumbService: JsPlumbService) { }

    public ngAfterViewInit(): void {
        this.selectBox = document.createElement('div');
        const selectArea = this.el.nativeElement.appendChild(this.selectBox);
        this.el.nativeElement.addEventListener("mousedown", (event: MouseEvent) => this.mouseDown(event));
        this.el.nativeElement.addEventListener("mousemove", (event: MouseEvent) => this.mouseMove(event));
        this.el.nativeElement.addEventListener("mouseup", (event: MouseEvent) => this.mouseUp(event));
    }

    public mouseDown(event: MouseEvent) {
        this.relatvieX = event.clientX - event.offsetX;
        this.relatvieY = event.clientY - event.offsetY;

        this.width = 0;
        this.height = 0;
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.endX = this.startX;
        this.endY = this.startY;
        this.selecting = true;
        this.updateSelectArea();
    }

    public mouseMove(event: MouseEvent) {
        this.endX = event.clientX;
        this.endY = event.clientY;

        this.updateSelectArea();
    }

    public mouseUp(event: MouseEvent) {
        this.selecting = false;
        this.updateSelectArea();
    }

    private updateSelectArea() {
        if (this.selecting) {
            this.selectBox.className = 'selecting';
        } else {
            this.selectBox.className = '';
            return;
        }

        this.getAllSelectedNodes();

        const leftTmp = this.startX >= this.endX ? this.endX : this.startX;
        const topTmp = this.startY >= this.endY ? this.endY : this.startY;

        this.left = leftTmp - this.relatvieX;
        this.top = topTmp - this.relatvieY;

        this.width = Math.abs(this.startX - this.endX);
        this.height = Math.abs(this.endY - this.startY);

        this.selectBox.style.top = this.top + 'px';
        this.selectBox.style.left = this.left + 'px';
        this.selectBox.style.width = this.width + 'px';
        this.selectBox.style.height = this.height + 'px';
    }

    public getAllSelectedNodes() {
        if(!this.selecting) {
            return;
        }
        const selectedNodes = [];

        const nodes = this.el.nativeElement.querySelectorAll('div.node');
        nodes.forEach(node => {
            if(this.checkNodeSelected(node)) {
                selectedNodes.push(node);
            }
        });

        this.jsPlumbService.jsplumbInstance.clearDragSelection();
        this.jsPlumbService.jsplumbInstance.addToDragSelection(selectedNodes);

    }

    private checkNodeSelected(node: any): boolean {
        const nodeLeft = node.offsetLeft;
        const nodeTop = node.offsetTop;
        const nodeRigth = nodeLeft + node.clientWidth;
        const nodeBottom = nodeTop + node.clientHeight;

        const selectedRight = this.left + this.width;
        const selectedBottom = this.top + this.height;

        return this.between(nodeLeft, this.left, selectedRight)
            && this.between(nodeRigth, this.left, selectedRight)
            && this.between(nodeTop, this.top, selectedBottom)
            && this.between(nodeBottom, this.top, selectedBottom);
    }

    private between(value, min, max): boolean {
        return min <= value && value <= max;
    }

}
