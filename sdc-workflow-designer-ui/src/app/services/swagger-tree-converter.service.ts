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

import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { ValueSource } from '../model/value-source.enum';
import { WorkflowUtil } from '../util/workflow-util';
import { WorkflowConfigService } from "./workflow-config.service";

@Injectable()
export class SwaggerTreeConverterService {
    private serviceName: string;
    private serviceVersion: string;

    constructor(private configService: WorkflowConfigService) {

    }

    public schema2TreeNode(key: string | number, serviceName: string, serviceVersion: string, schema: any): any {
        this.serviceName = serviceName;
        this.serviceVersion = serviceVersion;

        if (schema.$ref) {
            const treeNode = this.getTreeNodeBySwaggerDefinition(key, schema);
            return treeNode;
        } else {
            this.setInitValue4Param(schema.value, schema);
            return this.parameter2TreeNode(key, schema);
        }
    }

    private getTreeNodeBySwaggerDefinition(key: string | number, schema: any): TreeNode {
        const swagger = this.configService.getSwaggerInfo(this.serviceName, this.serviceVersion);
        if(swagger === undefined) {
            console.log(`swagger definition not exist, [${this.serviceName}].[${this.serviceVersion}]`);
            return null;
        }
        const swaggerDefinition = this.configService.getDefinition(swagger, schema.$ref);

        const definitionCopy = WorkflowUtil.deepClone(swaggerDefinition);

        this.setInitValue4Param(schema.value, definitionCopy);
        if (schema.value !== definitionCopy.value) {
            schema.value = definitionCopy.value;
        }

        return this.schema2TreeNode(key, this.serviceName, this.serviceVersion, definitionCopy);
    }

    private setInitValue4Param(value: any | any[], param: any) {
        param.value = value;
        if (value == null) {
            if (param.type === 'object') {
                param.value = {};
            } else if (param.type === 'array') {
                param.value = [];
            } else { // primary type
                param.valueSource = ValueSource[ValueSource.String];
            }
        }
    }

    private parameter2TreeNode(name: string | number, paramDefinition: any): any {
        const nodeType = this.getTreeNodeType(paramDefinition);

        const node = {
            label: name,
            type: nodeType,
            children: [],
            parameter: paramDefinition,
        };

        if (paramDefinition.type === 'object') {
            node.children = this.getPropertyFromObject(paramDefinition.value, paramDefinition);
        } else if (paramDefinition.type === 'array') {
            this.setChildrenForArray(node, paramDefinition);
        }

        return node;
    }

    private getTreeNodeType(param: any): string {
        const type = param.type;
        if (type === 'array') {
            return 'array';
        } else if (type === 'object') {
            if (param.additionalProperties) {
                return 'map';
            } else {
                return 'object';
            }
        } else {
            return 'default';
        }
    }

    private setChildrenForArray(node: any, param: any) {
        param.value.forEach((itemValue, index) => {
            const itemCopy = WorkflowUtil.deepClone(param.items);
            itemCopy.value = itemValue;
            node.children.push(this.schema2TreeNode(index, this.serviceName, this.serviceVersion, itemCopy));
        });
    }

    private getPropertyFromObject(objectValue: any, param: any): TreeNode[] {
        if (param.properties) {
            return this.getPropertyFromSimpleObject(objectValue, param.properties);
        } else if (param.additionalProperties) {
            return this.getPropertyFromMapOrDictionary(objectValue, param.additionalProperties);
        } else {
            return [];
        }

    }

    private getPropertyFromSimpleObject(objectValue: any, properties: any): TreeNode[] {
        const treeNodes: TreeNode[] = [];
        for (const key in properties) {
            const property = properties[key];
            this.setInitValue4Param(objectValue[key], property);

            if (property.value !== objectValue[key]) {
                objectValue[key] = property.value;
            }

            treeNodes.push(this.schema2TreeNode(key, this.serviceName, this.serviceVersion, property));
        }
        return treeNodes;
    }

    private getPropertyFromMapOrDictionary(mapOrDictionary: any, additionalProperties: any): TreeNode[] {
        const treeNodes: TreeNode[] = [];
        for (const key in mapOrDictionary) {
            const propertyCopy = WorkflowUtil.deepClone(additionalProperties);
            propertyCopy.value = mapOrDictionary[key];

            const treeNode = this.schema2TreeNode(key, this.serviceName, this.serviceVersion, propertyCopy);
            treeNode.keyEditable = true;
            treeNodes.push(treeNode);

            if (mapOrDictionary[key] !== propertyCopy.value) {
                mapOrDictionary[key] = propertyCopy.value;
            }
        }
        return treeNodes;
    }
}
