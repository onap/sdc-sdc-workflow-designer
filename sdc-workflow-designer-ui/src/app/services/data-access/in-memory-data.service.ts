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

import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
/**
 * InMemeoryDataService
 * Mock backend data
 */
export class InMemoryDataService implements InMemoryDbService {
    createDb() {
        const workflows = [{
            id: 'workflow1',
            name:'workflow1',
            nodes: [],
            configs:{
                microservices:[]
            }
        },{
            id:'workflow2',
            name: 'workflow2',
            nodes: [],
            configs:{
                microservices:[]
            }
        }
    ];
        return {workflows};
    }
}
