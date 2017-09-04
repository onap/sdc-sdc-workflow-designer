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
import { RestParameter } from './rest-parameter';
import { WorkflowNode } from './workflow-node';

export class RestTask extends WorkflowNode {
    public serviceName: string;
    public serviceVersion: string;
    public url: string;
    public method: string;
    public operationId: string;
    public produces: string[] = [];
    public consumes: string[] = [];
    public parameters: RestParameter[] = [];
    public responses: any[] = [];
}
