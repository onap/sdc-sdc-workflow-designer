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
import * as $ from 'jquery';

import { JsPlumbService } from '../../services/jsplumb.service';
import { ModelService } from '../../services/model.service';

@Directive({ selector: '[b4tResizable]' })
export class ResizableDirective implements AfterViewInit {

    constructor(private el: ElementRef,
                private jsPlumbService: JsPlumbService,
                private planModelService: ModelService) {
    }

    public ngAfterViewInit() {
        console.log('init resizble.');
        
        $(this.el.nativeElement).resizable({
            handles: 'all',
            resize: (event, ui) => {
                const element = ui.helper[0];
                this.planModelService.updatePosition(element.id,
                    element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight - 12);
                this.jsPlumbService.resizeParent(element, element.parentNode);
                const node = this.planModelService.getNodeMap().get(element.id);
                this.jsPlumbService.jsplumbInstanceMap.get(node.parentId).revalidate(element.id);
            },
        });
    }
}
