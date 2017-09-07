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

import { Component, Input, OnChanges, Output, SimpleChange, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { ValueSource } from '../../model/value-source.enum';
import { ValueType } from '../../model/value-type.enum';
import { Parameter } from '../../model/workflow/parameter';
import { RestParameter } from '../../model/workflow/rest-parameter';
import { RestTask } from '../../model/workflow/rest-task';
import { SwaggerTreeConverterService } from '../../services/swagger-tree-converter.service';
import { WorkflowUtil } from '../../util/workflow-util';
import { PlanTreeviewItem } from "../../model/plan-treeview-item";

/**
 * parameter tree presents parameter of task node's input and output parameters.
 */
@Component({
    selector: 'b4t-parameter-tree',
    styleUrls: ['./parameter-tree.component.css'],
    templateUrl: 'parameter-tree.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ParameterTreeComponent implements OnChanges {
    @Input() public parameters: TreeNode[];
    @Input() public task: RestTask;
    @Input() public defaultValueSource: string;
    @Input() public valueSource: ValueSource[];
    @Input() public planItems: PlanTreeviewItem[];

    constructor(private swaggerTreeConverterService: SwaggerTreeConverterService) { }

    public ngOnChanges(changes: SimpleChanges) {
        const changeParameters = changes["parameters"];
        if (changeParameters && 0 < changeParameters.currentValue.length) {
            this.formatParam(changeParameters.currentValue);
        }
    }

    public getParam(node: any) {
        if (undefined === node.parameter.name) {
            node.parameter.name = node.label;
            node.parameter.valueSource = this.defaultValueSource;
        } else {
            if (node.parent.parameter.value[node.label]) {
                node.parameter.value = node.parent.parameter.value[node.label].value;
                node.parameter.valueSource = node.parent.parameter.value[node.label].valueSource;
            } else {
                const tempParamValue: any = {};
                tempParamValue.value = '';
                tempParamValue.valueSource = this.defaultValueSource;
                node.parent.parameter.value[node.label] = tempParamValue;
                node.parameter.value = tempParamValue.value;
                node.parameter.valueSource = tempParamValue.valueSource;
            }
        }
        return node.parameter;
    }

    public paramChange(param: Parameter, node: any) {
        if (node.label !== param.name) {
            node.label = param.name;
            this.propertyKeyChanged(node, param.value);
        }
        if (node.parent) {
            if (node.parent.parameter.value[param.name]) {
                node.parent.parameter.value[param.name].value = param.value;
                node.parent.parameter.value[param.name].valueSource = param.valueSource;
            } else {
                node.parent.parameter.value[param.name] = {
                    value: param.value,
                    valueSource: param.valueSource
                };
            }
        }
    }

    public getKeyParameter(node: any) {
        return new Parameter('key', node.label, ValueSource[ValueSource.String], ValueType[ValueType.String]);
    }

    public keyParameterChange(node: any, parameter: Parameter) {
        node.label = parameter.value;
        this.propertyKeyChanged(node, parameter.value);
    }

    public getValueParameter(node: any, key: string) {
        const nodeValue = node[key] ? node[key] : {
            value: '',
            valueSource: ValueSource[ValueSource.String],
        };
        node[key] = nodeValue;
        return nodeValue;
    }

    public valueParameterChange(node: any, key: string, parameter: Parameter) {
        node[key].value = parameter.value;
        node[key].valueSource = parameter.valueSource;
    }

    public addChildNode4DynamicObject(node: any) {
        const copyItem = WorkflowUtil.deepClone(node.parameter.additionalProperties);
        const key = Object.keys(node.parameter.value).length;
        const childrenNode = this.swaggerTreeConverterService
            .schema2TreeNode(key, this.task.serviceName, this.task.serviceVersion, copyItem);

        childrenNode.keyEditable = true;
        node.parameter.value[key] = childrenNode.parameter.value;

        node.children.push(childrenNode);
    }

    public propertyKeyChanged(node: any, newKey: string) {
        const value = node.parent.parameter.value[node.label];
        node.parent.parameter.value[newKey] = value;
        delete node.parent.parameter.value[node.label];

        node.label = newKey;
    }

    public addChildNode4ObjectArray(node: any) {
        const copyItem = WorkflowUtil.deepClone(node.parameter.items);

        const childrenNode = this.swaggerTreeConverterService
            .schema2TreeNode(
            node.children.length,
            this.task.serviceName,
            this.task.serviceVersion,
            copyItem);

        node.parameter.value.push(childrenNode.parameter.value);
        node.children.push(childrenNode);
        this.initParam(node);
    }

    public deleteTreeNode(node: any) {
        // delete data
        node.parent.parameter.value.splice(node.label, 1);
        node.parent.children.splice(node.label, 1);

        // update node index
        node.parent.children.forEach((childNode, index) => childNode.label = index);
    }

    public canEditValue(node: any): boolean {
        return node.children.length === 0;
    }

    public canDelete(node: any) {
        const parent = node.parent;
        if (parent &&
            (this.isArrayObject(parent) || this.isDynamicObject(parent))) {
            return true;
        } else {
            return false;
        }
    }

    public updateObjectValue(node: any, value: string) {
        const newValueObj = JSON.parse(value);
        for (const key in node.parameter.value) {
            delete node.parameter.value[key];
        }

        for (const key in newValueObj) {
            node.parameter.value[key] = newValueObj[key];
        }
    }

    public getObjectValue(node) {
        return JSON.stringify(node.parameter.value);
    }

    public canAdd(node: any) {
        return this.isArrayObject(node) || this.isDynamicObject(node);
    }

    private formatParam(params: any[]): void {
        params.forEach(param => this.initParam(param));
    }

    private initParam(parameter: any, value?: any): void {
        if (!parameter || 0 === parameter.length) {
            return;
        }
        switch (parameter.type) {
            case 'default':
                parameter.parameter.name = parameter.label;
                if (value && value[parameter.label]) {
                    parameter.parameter.value = value[parameter.label].value;
                    parameter.parameter.valueSource = value[parameter.label].valueSource;
                } else {
                    parameter.parameter.valueSource = this.defaultValueSource;
                }
                break;
            case 'object':
                for (let index = 0; index < parameter.children.length; index++) {
                    let param = parameter.children[index];
                    this.initParam(param, parameter.parameter.value);
                }
                break;
            case 'array':
                for (let index = 0; index < parameter.children.length; index++) {
                    let param = parameter.children[index];
                    this.initParam(param, parameter.parameter.value);
                }
                break;
            default:
                console.log('init a unsupport parameter, type is:' + parameter.type);
                break;
        }
    }

    private isArrayObject(node: any): boolean {
        return node.type === 'array';
    }

    private isDynamicObject(node: any): boolean {
        return node.type === 'map';
    }
}
