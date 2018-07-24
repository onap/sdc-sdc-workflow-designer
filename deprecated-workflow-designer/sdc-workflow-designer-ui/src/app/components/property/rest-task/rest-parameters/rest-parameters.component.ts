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
import { PlanTreeviewItem } from '../../../../model/plan-treeview-item';
import { SwaggerBaseParameter } from '../../../../model/workflow/swagger/swagger-base-parameter';
import { SwaggerResponse } from '../../../../model/workflow/swagger/swagger-response';
import { TreeNode } from 'primeng/components/common/treenode';
import { ValueSource } from '../../../../model/value-source.enum';
import { SwaggerIn } from '../../../../model/workflow/swagger/swagger-in.enum';
import { SwaggerBodyParameter } from '../../../../model/workflow/swagger/swagger-body-parameter';
import { SwaggerTreeConverterService } from '../../../../services/swagger-tree-converter.service';
import { SwaggerSchema } from '../../../../model/workflow/swagger/swagger-schema';
import { WorkflowUtil } from '../../../../util/workflow-util';
import { Parameter } from '../../../../model/workflow/parameter';
import { SwaggerNormalParameter } from '../../../../model/workflow/swagger/swagger-normal-parameter';
import { ValueType } from '../../../../model/value-type.enum';
import { ValueObject } from '../../../../model/value-object';

@Component({
  selector: 'wfm-rest-parameters',
  templateUrl: './rest-parameters.component.html',
  styleUrls: ['./rest-parameters.component.css']
})
export class RestParametersComponent implements OnInit {
  @Input() public dataTypeInput: SwaggerBaseParameter[];
  @Input() public dataTypeOutput: SwaggerResponse[];
  @Input() public definitions: any;
  @Input() public planItems: PlanTreeviewItem[];
  public queryParams: Parameter[] = [];
  public headerParams: Parameter[] = [];
  public pathParams: Parameter[] = [];
  public formDataParams: Parameter[] = [];
  public bodyParams: TreeNode[] = [];
  public responseParams: TreeNode[] = [];

  public inputValueSource = [ValueSource.Variable, ValueSource.Plan, ValueSource.Topology];
  public outputValueSource = [];
  constructor() { }

  ngOnInit() {
    if (this.dataTypeInput) {
      this.dataTypeInput.forEach(input => {
        switch (input.in) {
          case SwaggerIn[SwaggerIn.query]:
            let query = this.normal2Parameter(input as SwaggerNormalParameter);
            input.value = query.value;
            input.valueSource = query.valueSource;
            this.queryParams.push(query);
            break;
          case SwaggerIn[SwaggerIn.header]:
            let header = this.normal2Parameter(input as SwaggerNormalParameter);
            input.value = header.value;
            input.valueSource = header.valueSource;
            this.headerParams.push(header);
            break;
          case SwaggerIn[SwaggerIn.path]:
            let path = this.normal2Parameter(input as SwaggerNormalParameter);
            input.value = path.value;
            input.valueSource = path.valueSource;
            this.pathParams.push(path);
            break;
          case SwaggerIn[SwaggerIn.formData]:
            let formData = this.normal2Parameter(input as SwaggerNormalParameter);
            input.value = formData.value;
            input.valueSource = formData.valueSource;
            this.formDataParams.push(formData);
            break;
          case SwaggerIn[SwaggerIn.body]:
            let body = this.body2TreeNode(input as SwaggerBodyParameter);
            input.value = body.value.value;
            input.valueSource = body.value.valueSource;
            this.bodyParams.push(body);
            break;
          default:
            console.warn(`Not support this parameters in:${input.in}`);
            break;
        }
      });
    }
    this.responseParams.push(this.parameter2TreeNode('status',
      { type: ValueType[ValueType.number], editable: false }, { value: '', valueSource: ValueSource.string }));
    if (this.dataTypeOutput) {
      this.dataTypeOutput.forEach(output => {
        const treeNode = this.swaggerResponse2TreeNode(output as SwaggerResponse);
        if (treeNode) {
          this.responseParams.push(treeNode);
        }
      });
    }
  }

  public onParamChange(param: Parameter) {
    this.dataTypeInput.forEach(input => {
      if (input.name === param.name) {
        input.value = param.value;
        input.valueSource = param.valueSource;
      }
    });
  }

  private normal2Parameter(normalParam: SwaggerNormalParameter): Parameter {
    let finalValue;
    let finalValueSource;
    if (normalParam.value && normalParam.value && normalParam.valueSource) {
      finalValue = normalParam.value;
      finalValueSource = normalParam.valueSource;
    } else {
      finalValue = normalParam.default;
      finalValueSource = ValueSource[ValueSource.string];
    }
    let parameter = new Parameter(normalParam.name, finalValue, finalValueSource, normalParam.type, normalParam.required, normalParam.show);
    return parameter;
  }

  private body2TreeNode(bodyParam: SwaggerBodyParameter) {
    return this.swaggerSchema2TreeNode(bodyParam.name, bodyParam.schema, bodyParam);
  }

  private swaggerResponse2TreeNode(responseParam: SwaggerResponse): TreeNode {
    if (responseParam.$ref) {
      return this.swaggerRef2TreeNode(responseParam.name, responseParam.$ref);
    } else if (responseParam.schema) {
      return this.swaggerSchema2TreeNode(responseParam.name, responseParam.schema);
    } else {
      console.log(`Unsupport response parameter:${responseParam.name}`);
      return null;
    }
  }

  private swaggerSchema2TreeNode(name: string | number, schema: SwaggerSchema, value?: any) {
    if (schema.$ref) {
      return this.swaggerRef2TreeNode(name as string, schema.$ref);
    } else {
      value = this.getInitValue4Param(schema, value);
      return this.parameter2TreeNode(name, schema, value);
    }
  }

  private swaggerRef2TreeNode(name: string, ref: string, value?: any) {
    let definition = this.definitions[ref];
    let refTreeNode = {
      label: 'Unsupport Ref Parameter',
      type: this.getTreeNodeType(ref),
      required: definition.required,
      children: [],
      definition: definition,
      value: value,
    };

    // if (value.valueSource === ValueSource[ValueSource.Definition]) {
    //   if (definition.type === 'object') {
    //     refTreeNode.children = this.getPropertyFromObject(definition, value.value);
    //   } else if (definition.type === 'array') {
    //     refTreeNode.children = this.setChildrenForArray(definition, value.value);
    //   }
    // }
    return refTreeNode;
  }

  private getInitValue4Param(schema: SwaggerSchema, value: any) {
    let definition = schema;
    if (schema.$ref) {
      definition = this.definitions[schema.$ref];
    }
    let valueObject: ValueObject = { valueSource: ValueSource[ValueSource.string] };
    if (undefined == value) {
      valueObject.value = definition.default;
      if (ValueType[ValueType.array] === definition.type || ValueType[ValueType.object] === definition.type) {
        valueObject.valueSource = ValueSource[ValueSource.Definition];
      } else {
        valueObject.valueSource = definition.type;
      }
    } else {
      if('object' != typeof(value)){
        console.error('Param value is not object!, param definition is:' + definition);
      }
      valueObject.valueSource = value.valueSource;
      valueObject.value = undefined === value.value ? definition.default : value.value;
    }
    if (ValueType[ValueType.object] === definition.type) {
      return this.getInitValue4Object(valueObject);
    } else if (ValueType[ValueType.array] === definition.type) {
      // if (undefined == value) {
      //   valueObject.value = definition.default;
      //   if (ValueType[ValueType.array] === definition.type || ValueType[ValueType.object] === definition.type) {
      //     valueObject.valueSource = ValueSource[ValueSource.Definition];
      //   } else {
      //     valueObject.valueSource = definition.type;
      //   }
      // } else {
      //   valueObject.valueSource = value.valueSource;
      //   valueObject.value = undefined === value.value ? definition.default : value.value;
      // }
      return this.getInitValue4Array(valueObject);
    } else { // primary type
      // valueObject.value = undefined === value ? definition.default : value;
      // valueObject.valueSource = definition.type;
      return this.getInitValue4Primary(valueObject);
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
      valueSource: ValueSource[ValueSource.string]
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
      value: value
    };

    if (value.valueSource === ValueSource[ValueSource.Definition]) {
      if (ValueType[ValueType.object] === definition.type) {
        node.children = this.getPropertyFromObject(definition, value.value);
      } else if (ValueType[ValueType.array] === definition.type) {
        node.children = this.getItemsFromArray(definition, value.value);
      }
    }

    return node;
  }

  private getTreeNodeType(param: any): string {
    const type = param.type;
    if (ValueType[ValueType.array] === type) {
      return 'array';
    } else if (ValueType[ValueType.object] === type) {
      if (param.additionalProperties) {
        return 'map';
      } else {
        return 'object';
      }
    } else {
      return 'default';
    }
  }

  private getPropertyFromObject(schema: SwaggerSchema, value: any): TreeNode[] {
    if (schema.properties) {
      const required = schema.required as string[];
      return this.getPropertyFromSimpleObject(schema.properties, value, required);
    } else if (schema.additionalProperties) {
      return this.getPropertyFromMapOrDictionary(schema.additionalProperties, value);
    } else {
      console.warn('getPropertyFromObject() return [], param is:' + JSON.stringify(schema));
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

      const treeNode = this.swaggerSchema2TreeNode(key, property, objectValue[key]);
      treeNodes.push(treeNode);
    }
    return treeNodes;
  }

  private getPropertyFromMapOrDictionary(additionalProperties: any, mapOrDictionary: any): TreeNode[] {
    const treeNodes: TreeNode[] = [];
    for (const key in mapOrDictionary) {
      const propertyCopy = WorkflowUtil.deepClone(additionalProperties);
      propertyCopy.value = mapOrDictionary[key];
      const treeNode = this.swaggerSchema2TreeNode(key, propertyCopy, propertyCopy.value);
      treeNode.keyEditable = true;
      treeNodes.push(treeNode);
      if (mapOrDictionary[key] !== propertyCopy.value) {
        mapOrDictionary[key] = propertyCopy.value;
      }
    }
    return treeNodes;
  }

  private getItemsFromArray(definition: any, value: any[]): any[] {
    const children = [];
    value.forEach((itemValue, index) => {
      const itemCopy = WorkflowUtil.deepClone(definition.items);
      children.push(this.swaggerSchema2TreeNode(index, itemCopy, itemValue));
    });

    return children;
  }

}
