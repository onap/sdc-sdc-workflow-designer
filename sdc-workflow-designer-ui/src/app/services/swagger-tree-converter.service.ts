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
import { RestService } from './rest.service';
import { Swagger } from "../model/swagger";

@Injectable()
export class SwaggerTreeConverterService {

  private swagger: Swagger;

  constructor(private restService: RestService) {

  }

  public schema2TreeNode(swagger: Swagger, key: string | number, schema: any, value?: any): any {
    this.swagger = swagger;
    if (schema.$ref) {
      const treeNode = this.getTreeNodeBySwaggerDefinition(key, schema, value);
      return treeNode;
    } else {
      value = this.getInitValue4Param(schema, value);
      return this.parameter2TreeNode(key, schema, value);
    }
  }

  private getTreeNodeBySwaggerDefinition(key: string | number, schema: any, value: any): TreeNode {
    const swaggerDefinition = this.restService.getDefinition(this.swagger, schema.$ref);

    const definitionCopy = WorkflowUtil.deepClone(swaggerDefinition);

    value = this.getInitValue4Param(definitionCopy, value);

    return this.schema2TreeNode(this.swagger, key, definitionCopy, value);
  }

  private getInitValue4Param(definition: any, value: any) {
    if (definition.$ref) {
      definition = this.restService.getDefinition(this.swagger, definition.$ref);
    }
    if (definition.type === 'object') {
      return this.getInitValue4Object(value);
    } else if (definition.type === 'array') {
      return this.getInitValue4Array(value);
    } else { // primary type
      return this.getInitValue4Primary(value);
    }
  }

  private getInitValue4Object(value: any) {
    const newValue = {
      value: {},
      valueSource: ValueSource[ValueSource.Definition]
    };

    if (!value || '' === value) {
      return newValue;
    } else {
      if (value.valueSource !== ValueSource[ValueSource.Definition]) {
        return value;
      } else {
        if (typeof value.value !== 'object') {
          value.value = {};
        }
        return value;
      }
    }
  }

  private getInitValue4Array(value: any) {
    const newValue = {
      value: [],
      valueSource: ValueSource[ValueSource.Definition]
    };

    if (!value || '' === value) {
      return newValue;
    } else {
      if (value.valueSource !== ValueSource[ValueSource.Definition]) {
        return value;
      } else {
        if (!(value.value instanceof Array)) {
          value.value = [];
        }
        return value;
      }
    }
  }

  private getInitValue4Primary(value: any) {
    const newValue = {
      value: '',
      valueSource: ValueSource[ValueSource.String]
    };

    if (!value) {
      return newValue;
    } else {
      if (typeof value.value === 'object') {
        value.value = '';
      }
      return value;
    }
  }

  private parameter2TreeNode(name: string | number, definition: any, value: any): any {
    const nodeType = this.getTreeNodeType(definition);

    const node = {
      label: name,
      type: nodeType,
      required: definition.required,
      children: [],
      definition: definition,
      value: value,
    };

    if (value.valueSource === ValueSource[ValueSource.Definition]) {
      if (definition.type === 'object') {
        node.children = this.getPropertyFromObject(definition, value.value);
      } else if (definition.type === 'array') {
        node.children = this.setChildrenForArray(definition, value.value);
      }
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

  private setChildrenForArray(definition: any, value: any[]): any[] {
    const children = [];
    value.forEach((itemValue, index) => {
      const itemCopy = WorkflowUtil.deepClone(definition.items);
      children.push(this.schema2TreeNode(this.swagger, index, itemCopy, itemValue));
    });

    return children;
  }

  private getPropertyFromObject(definition: any, value: any): TreeNode[] {
    if (definition.properties) {
      return this.getPropertyFromSimpleObject(definition.properties, value, definition.required);
    } else if (definition.additionalProperties) {
      return this.getPropertyFromMapOrDictionary(definition.additionalProperties, value);
    } else {
      console.log('getPropertyFromObject() return [], param is:' + JSON.stringify(definition));
      return [];
    }

  }

  private getPropertyFromSimpleObject(properties: any, objectValue: any, required: string[]): TreeNode[] {
    const treeNodes: TreeNode[] = [];
    for (const key in properties) {
      let property = properties[key];
      // init required property
      property.required = false;
      if (Array.isArray(required)) {
        for (let index = 0; index < required.length; index++) {
          if (required[index] === key) {
            property.required = true;
            break;
          }
        }
      }

      objectValue[key] = this.getInitValue4Param(property, objectValue[key]);

      const treeNode = this.schema2TreeNode(this.swagger, key, property, objectValue[key]);
      treeNodes.push(treeNode);
    }
    return treeNodes;
  }

  private getPropertyFromMapOrDictionary(additionalProperties: any, mapOrDictionary: any): TreeNode[] {
    const treeNodes: TreeNode[] = [];
    for (const key in mapOrDictionary) {
      const propertyCopy = WorkflowUtil.deepClone(additionalProperties);
      propertyCopy.value = mapOrDictionary[key];

      const treeNode = this.schema2TreeNode(this.swagger, key, propertyCopy, propertyCopy.value);
      treeNode.keyEditable = true;
      treeNodes.push(treeNode);

      if (mapOrDictionary[key] !== propertyCopy.value) {
        mapOrDictionary[key] = propertyCopy.value;
      }
    }
    return treeNodes;
  }
}
