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

import { Component, Input, OnChanges, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { PlanTreeviewItem } from '../../model/plan-treeview-item';
import { ValueSource } from '../../model/value-source.enum';
import { ValueType } from '../../model/value-type.enum';
import { Parameter } from '../../model/workflow/parameter';
import { RestTask } from '../../model/workflow/rest-task';
import { SwaggerTreeConverterService } from '../../services/swagger-tree-converter.service';
import { WorkflowUtil } from '../../util/workflow-util';
import { Swagger } from "../../model/swagger";
import { WorkflowConfigService } from "../../services/workflow-config.service";
import { RestService } from '../../services/rest.service';

/**
 * parameter tree presents parameter of task node's input and output parameters.
 */
@Component({
    selector: 'b4t-parameter-tree',
    styleUrls: ['./parameter-tree.component.css'],
    templateUrl: 'parameter-tree.component.html',
})
export class ParameterTreeComponent implements OnChanges {
    @Input() public parameters: TreeNode[];
    @Input() public task: RestTask;
    @Input() public defaultValueSource: string;
    @Input() public valueSource: ValueSource[];
    @Input() public planItems: PlanTreeviewItem[];
    @Input() public restConfigId: string;

    constructor(private restService: RestService, private swaggerTreeConverterService: SwaggerTreeConverterService) { }

    public ngOnChanges(changes: SimpleChanges) {
        // const changeParameters = changes['parameters'];
        // if (changeParameters && 0 < changeParameters.currentValue.length) {
        //     this.formatParam(changeParameters.currentValue);
        // }
    }

    public getParameter(node: any): Parameter {
        return new Parameter(node.label,node.value.value, node.value.valueSource, node.definition.type);
    }


    public paramChange(param: Parameter, node: any) {
        node.value.valueSource = param.valueSource;
        node.value.value = param.value;

        this.objectParameterChange(node);

        if (node.label !== param.name) {
            delete node.parent.value.value[node.label];
            node.label = param.name;
        }
        if (node.parent) {
            node.parent.value.value[node.label] = node.value;
        } else {
            console.warn('Node.parent does not exists!' + JSON.stringify(node));
        }

    }

    private objectParameterChange(node: any) {
      if(node.value.valueSource === ValueSource[ValueSource.Definition]) { // value will be set by node defintion
        const treeNode = this.swaggerTreeConverterService.schema2TreeNode(this.getSwagger(), node.label, node.definition, node.value);
        node.value = treeNode.value;
        node.children = treeNode.children;
      } else {  // parameter value will be set by param
        node.children = [];
      }
    }

    private getSwagger(): Swagger {
        return this.restService.getSwaggerInfo(this.restConfigId);
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
        const copyItem = WorkflowUtil.deepClone(node.definition.additionalProperties);
        const key = Object.keys(node.value.value).length;

        const childrenNode = this.swaggerTreeConverterService
            .schema2TreeNode(this.getSwagger(), key, copyItem);

        childrenNode.keyEditable = true;
        node.value.value[key] = childrenNode.value;

        node.children.push(childrenNode);
    }

    public propertyKeyChanged(node: any, newKey: string) {
        const value = node.parent.value.value[node.label];
        node.parent.value.value[newKey] = value;
        delete node.parent.value.value[node.label];

        node.label = newKey;
    }

    public addChildNode4ObjectArray(node: any) {
        const copyItem = WorkflowUtil.deepClone(node.definition.items);

        const childrenNode = this.swaggerTreeConverterService
            .schema2TreeNode(
            this.getSwagger(),
            node.children.length,
            copyItem);

        node.value.value.push(childrenNode.value);
        node.children.push(childrenNode);
    }

    public deleteTreeNode(node: any) {
        if ('array' === node.parent.type) {
            // delete data
            node.parent.value.value.splice(node.label, 1);
            node.parent.children.splice(node.label, 1);

            // update node index
            node.parent.children.forEach((childNode, index) => childNode.label = index);
        } else if ('map' === node.parent.type) {
            delete node.parent.value.value[node.label];
            for (let index = 0; index < node.parent.children.length; index++) {
                const element = node.parent.children[index];
                if (element.label === node.label) {
                    node.parent.children.splice(index, 1);
                    break;
                }
            }
        }
    }

    public canEditValue(node: any): boolean {
        return node.children.length === 0;
    }

    public editNode(node: any) {
      node.editing = true;
    }

    public editComplete(node: any) {
      node.editing = false;

      const newValueObj = JSON.parse(node.tempValue);
      for (const key in node.value.value) {
          delete node.value.value[key];
      }

      for (const key in newValueObj) {
          node.value.value[key] = newValueObj[key];
      }

      // delete all children nodes

      // add new nodes by new value

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
        node.tempValue = value;
        // const newValueObj = JSON.parse(value);
        // for (const key in node.parameter.value) {
        //     delete node.parameter.value[key];
        // }

        // for (const key in newValueObj) {
        //     node.parameter.value[key] = newValueObj[key];
        // }
    }

    public getObjectValue(node) {
        return JSON.stringify(node.value.value);
    }

    public getObjectValueSource(): ValueSource[] {
      const result = [];
      result.push(ValueSource.Definition);
      this.valueSource.forEach(source => result.push(source));
      return result;
    }

    public canAdd(node: any) {
        return this.isArrayObject(node) || this.isDynamicObject(node);
    }

    private isArrayObject(node: any): boolean {
        return node.type === 'array';
    }

    private isDynamicObject(node: any): boolean {
        return node.type === 'map';
    }

    public getWidth(node: any) {
        if(this.canAdd(node)) {
            return {
                'col-md-11': true
            };
        } else {
            return {
                'col-md-12': true
            };
        }
    }
}
