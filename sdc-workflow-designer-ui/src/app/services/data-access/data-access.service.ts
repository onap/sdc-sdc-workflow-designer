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
import { Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { NodeTemplate } from '../../model/nodetemplate';
import { Operation } from '../../model/operation';
import { PageParameter } from '../../model/page-parameter';
import { Node } from '../../model/workflow/node';
import { HttpService } from '../../util/http.service';
import { BroadcastService } from './../broadcast.service';

/**
 * PersistenceService
 * provides operation about data persistence. It can load and save data from backend.
 */
@Injectable()
export class DataAccessService {

    constructor(private broadcastService: BroadcastService,
                private httpService: HttpService) {
        this.broadcastService.saveEvent$.subscribe(data => this.save(data));
    }

    public save(data: string) {
        const url = 'save data url'; // TODO
        
        console.log("save data success");
        
        console.log(data);
    }

    public loadPlan(param: any) {
        const url = 'get data url'; // TODO
        
        this.broadcastService.broadcast(this.broadcastService.planModel, []);
    }
}
