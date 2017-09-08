/*******************************************************************************
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 *******************************************************************************/
import { AfterViewInit, Component, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import {IntermediateCatchEvent} from '../../../model/workflow/intermediate-catch-event';

@Component({
    selector: 'b4t-intermediate-catch-event',
    templateUrl: 'intermediate-catch-event.component.html',
})
export class IntermediateCatchEventComponent {
    @Input() public node: IntermediateCatchEvent;

    public timerTypeChange(type: string) {
        const timer = this.node.timerEventDefinition;
        timer.type = type;
        timer.timeCycle = '';
        timer.timeDate = '';
        timer.timeDuration = '';
    }
}
