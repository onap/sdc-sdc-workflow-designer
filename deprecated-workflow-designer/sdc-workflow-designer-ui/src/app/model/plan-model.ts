/**
 * Copyright (c) 2017-2018 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */
import { WorkflowNode } from './workflow/workflow-node';
import { Model } from './model';

export class PlanModel {
    public id: string;
    public uuid: string;
    public operationId: string;
    public name: string;
    public version: string;
    public description: string;
    public scene: string;
    public data = new Model();
}
