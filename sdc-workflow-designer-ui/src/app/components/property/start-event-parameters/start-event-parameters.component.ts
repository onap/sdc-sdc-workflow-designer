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
import { Component, Input, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ValueSource } from '../../../model/value-source.enum';
import { Parameter } from '../../../model/workflow/parameter';
import { StartEvent } from '../../../model/workflow/start-event';
import { BroadcastService } from '../../../services/broadcast.service';

@Component({
    selector: 'b4t-start-event-parameters',
    templateUrl: 'start-event-parameters.component.html',
})
export class StartEventParametersComponent {
    @Input() public node: StartEvent;
    public sources: ValueSource[] = [ValueSource.String];

    public create(): void {
        this.node.parameters.push(new Parameter('', '', ValueSource[ValueSource.String]));
    }

    public delete(index: number): void {
        this.node.parameters.splice(index, 1);
    }
}
