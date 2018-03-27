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
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ValueSource } from '../../../model/value-source.enum';
import { Parameter } from '../../../model/workflow/parameter';
import { StartEvent } from '../../../model/workflow/start-event';
import { BroadcastService } from '../../../services/broadcast.service';
import { WorkflowUtil } from '../../../util/workflow-util';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'wfm-start-event',
    styleUrls: ['./start-event.component.css'],
    templateUrl: 'start-event.component.html',
})
export class StartEventComponent implements OnInit {
    @Input() public node: StartEvent;
    public sources: ValueSource[] = [ValueSource.string];

    constructor(private translate: TranslateService) { }

    ngOnInit() { }

    public create(): void {
        let parameter = new Parameter('', '', ValueSource[ValueSource.string]);
        this.node.parameters.push(parameter);
    }

    public delete(index: number): void {
        this.node.parameters.splice(index, 1);
    }

    public checkKey(newName: string, index: number): void {
        this.node.parameters[index].name = newName;
        this.node.parameters.forEach(parameter => {
            parameter.errorMsg = '';
        });
        if (!newName) {
            this.translate.get('WORKFLOW.MSG.VARIABLE_EMPTY').subscribe((res: string) => {
                this.node.parameters[index].errorMsg = res;
            });
        }
        this.node.parameters.forEach((parameter, i) => {
            if (i + 1 < this.node.parameters.length) {
                for (let j = i + 1; j < this.node.parameters.length; j++) {
                    let element = this.node.parameters[j];
                    if (element.name && parameter.name === element.name) {
                        this.translate.get('WORKFLOW.MSG.VARIABLE_SAME').subscribe((res: string) => {
                            parameter.errorMsg = res;
                            element.errorMsg = res;
                        });
                    }
                }
            }
        });
    }
}
