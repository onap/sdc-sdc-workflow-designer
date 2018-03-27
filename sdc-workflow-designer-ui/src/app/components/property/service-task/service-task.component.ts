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
import { Component, Input, OnInit } from '@angular/core';
import { ServiceTask } from '../../../model/workflow/service-task';
import { NodeTypeService } from '../../../services/node-type.service';
import { Parameter } from '../../../model/workflow/parameter';
import { ValueSource } from '../../../model/value-source.enum';

@Component({
  selector: 'wfm-service-task',
  templateUrl: './service-task.component.html',
  styleUrls: ['./service-task.component.css']
})
export class ServiceTaskComponent implements OnInit {
  @Input() public node: ServiceTask;
  public canEdit = true;
  public inputValueSource = [ValueSource.Variable];
  public outputValueSource = [];
  constructor(private nodeTypeService: NodeTypeService) { }

  public ngOnInit() {
    const nodeDataType = this.nodeTypeService.getNodeDataTypeById(this.node.typeId);
    if (nodeDataType.content && nodeDataType.content.class && '' != nodeDataType.content.class) {
      this.canEdit = false;
    }
    if (!this.node.className) {
      this.node.className = '';
      if (nodeDataType.content.class) {
        this.node.className = nodeDataType.content.class;
      }
    }

    let inputs = nodeDataType.content.inputs;
    if (!this.node.inputs) {
      // Set default value
      this.node.inputs = [];
      if (inputs) {
        for (const key in inputs) {
          if (inputs.hasOwnProperty(key)) {
            const element = inputs[key];
            this.node.inputs.push(new Parameter(key, element.default, ValueSource[ValueSource.string],
              element.type, element.required, element.show));
          }
        }
      }
    } else {
      // Load parameter value
      // todo: 
    }

    let outputs = nodeDataType.content.outputs;
    if (!this.node.outputs) {
      // Set default value
      this.node.outputs = [];
      if (outputs) {
        for (const key in outputs) {
          if (outputs.hasOwnProperty(key)) {
            const element = outputs[key];
            this.node.outputs.push(new Parameter(key, element.default, ValueSource[ValueSource.string],
              element.type, element.required));
          }
        }
      }
    } else {
      // Load parameter value
      // todo: 
    }
  }

  public createInput(): void {
    this.node.inputs.push(new Parameter('', '', ValueSource[ValueSource.string]));
  }

  public deleteInput(index: number): void {
    this.node.inputs.splice(index, 1);
  }
  public createOutput(): void {
    this.node.outputs.push(new Parameter('', '', ValueSource[ValueSource.string]));
  }

  public deleteOutput(index: number): void {
    this.node.outputs.splice(index, 1);
  }

  private getParameters() {

  }
}
