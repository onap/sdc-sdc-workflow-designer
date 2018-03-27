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

import {Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {isArray, isObject} from "util";
import {ModelService} from "../../services/model.service";
import {NoticeService} from "../../services/notice.service";
import {NodeType} from "../../model/workflow/node-type.enum";
import {ValueSource} from "../../model/value-source.enum";
import {JsPlumbService} from "../../services/jsplumb.service";
import {WorkflowNode} from "../../model/workflow/workflow-node";

/**
 * node or workflow-line name
 */
@Component({
    selector: 'wfm-editable-property',
    templateUrl: 'editable-property.component.html',
    styleUrls: ['./editable-property.component.css']
})
export class EditablePropertyComponent {
    @Input() public value: string;
    @Output() public valueChange = new EventEmitter<string>();
    @ViewChild('editInput') private editInput: any;

    public editValue = '';
    public editable = false;

    public preEdit(): void {
        if (!this.editable) {
            this.editable = true;
            this.editValue = this.value;
        }
    }

    public afterEdit(): void {
        if (this.editable) {
            this.editable = false;
            if (this.value === this.editValue) {
                return;
            }

            if (this.editInput.wfInput.valid) {
                this.value = this.editValue;
                this.valueChange.emit(this.value);
            } else {
                this.editValue = this.value;
            }
        }
    }

    /*private validate(): boolean {
        const nodes = this.modelService.getNodes();
        const existNode = nodes.find(node => node.id === this.editValue);
        if (existNode) {
            this.translate.get('WORKFLOW.MSG.NODE_ID_SAME', {value: existNode.id}).subscribe((res: string) => {
                this.notice.error(res, 10000);
            });
            return false;
        }
        return true;
    }

    private changeReferencedValue(): void {
        const newNodeConnections = [];
        const nodes = this.modelService.getNodes();
        nodes.forEach((node: any) => {
            this.changeConnectionReferencedValue(node, this.value, this.editValue);

            if (node.type === NodeType[NodeType.restTask]) {
                const parameters = node.parameters || [];
                parameters.forEach(param => {
                    this.changeRestTaskReferencedValue(param, this.value, this.editValue);
                });
            }
        });
    }

    private changeConnectionReferencedValue(node: WorkflowNode, oldValue: string, newValue: string): void {
        node.connection.forEach(connection => {
            if (connection.sourceRef === oldValue) {
                connection.sourceRef = newValue;
            } else if (connection.targetRef === oldValue) {
                connection.targetRef = newValue;
            }
        });
    }

    // 当restTask类型的节点的属性中valueSource是Plan时，value的值为引用其他节点id
    // value格式为[restTask_2].[responseBody].[name]，可能有更多层，当时第一个[]里面的值为被引用节点的id
    private changeRestTaskReferencedValue(param: any, oldValue: string, newValue: string): void {
        if (param.valueSource === ValueSource[ValueSource.Plan]) {
            const value = param.value || '';
            const index = value.indexOf('].[');
            if (index > -1) {
                const nodeId = value.substring(1, index);
                if (nodeId === oldValue) {
                    param.value = '[' + newValue + value.substring(index);
                }
            }
        } else if (param.valueSource === ValueSource[ValueSource.Definition]) {
            const value = param.value;
            if (isArray(value)) {
                value.forEach(subValue => {
                    this.changeRestTaskReferencedValue(subValue, oldValue, newValue);
                });
            } else if (isObject(value)) {
                this.changeRestTaskReferencedValue(value, oldValue, newValue);
            }
        }
    }*/
}
