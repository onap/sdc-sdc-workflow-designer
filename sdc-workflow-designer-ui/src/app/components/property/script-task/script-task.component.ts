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

import { ScriptTask } from "../../../model/workflow/script-task";
import { NodeTypeService } from '../../../services/node-type.service';

@Component({
    selector: 'wfm-script-task',
    templateUrl: 'script-task.component.html',
})
export class ScriptTaskComponent implements OnInit {
    @Input() public node: ScriptTask;

    public canChangeFormat = true;
    public scriptOperations = ['JavaScript', 'Groovy'];

    constructor(private nodeTypeService: NodeTypeService) { }

    public ngOnInit() {
        const nodeDataType = this.nodeTypeService.getNodeDataTypeById(this.node.typeId);
        let scriptFormat = nodeDataType.content.scriptFormat;
        // scriptFormat is not support, reset it as null;
        if (undefined === this.scriptOperations.find(format => format == scriptFormat)) {
            scriptFormat = null;
        }
        // Defined scriptFormat value, use it as default and can not change.
        if (scriptFormat && '' != scriptFormat) {
            this.canChangeFormat = false;
            if (!this.node.scriptFormat || '' == this.node.scriptFormat) {
                this.node.scriptFormat = scriptFormat;
                this.node.script = nodeDataType.content.script;
            }
        } else {
            // Default scriptFormat value should be 'JavaScript'
            if (!this.node.scriptFormat || '' == this.node.scriptFormat) {
                this.node.scriptFormat = 'JavaScript';
                this.node.script = '';
            }
        }
    }
}
