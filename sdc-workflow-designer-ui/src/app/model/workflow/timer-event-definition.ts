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
import { WorkflowNode } from './workflow-node';

export enum TimerEventDefinitionType {
    timeDate,
    timeDuration,
    timeCycle,
}

export class TimerEventDefinition {
    constructor(public type: string, // 'timeDate',  'timeCycle', 'timeDuration'
        public timeDate?: string, // <timeDate>10/10/2099 00:00:00</timeDate>
        public timeDuration?: string, // ISO 8601  P1Y3M5DT6H7M30S
        public timeCycle?: string) { // ISO 8601  P1Y3M5DT6H7M30S

    }
}
