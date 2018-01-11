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
import { Component, Input } from '@angular/core';

import { ValueSource } from '../../../model/value-source.enum';
import { Parameter } from '../../../model/workflow/parameter';
import { ErrorEvent } from '../../../model/workflow/error-event';

@Component({
    selector: 'b4t-error-event',
    templateUrl: 'error-event.component.html',
})
export class ErrorEventComponent {
    @Input() public node: ErrorEvent;
    public sources: ValueSource[] = [ValueSource.String];
}
