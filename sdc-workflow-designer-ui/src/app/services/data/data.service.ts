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
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';

import { PlanModel } from '../../model/plan-model';
import { NodeTemplate } from '../../model/topology/node-template';
import { HttpService } from '../../util/http.service';
import { BroadcastService } from '../broadcast.service';
import { SettingService } from "../setting.service";
import { NoticeService } from '../notice.service';
import { BackendService } from './backend.service';
import { SdcService } from './sdc.service';

/**
 * DataService
 * BackendService factory, provide backend service by running environment.
 */
@Injectable()
export class DataService {
    private service: BackendService;

    constructor(private broadcastService: BroadcastService, private noticeService: NoticeService,
        protected httpService: HttpService, private translate: TranslateService,
        private settingService: SettingService, private activatedRoute: ActivatedRoute) {
        this.createBackendService();
    }

    public initData(): void {
        this.activatedRoute.queryParams.subscribe(queryParams => {
            this.service.setParameters(queryParams);
        });
    }

    public getTopologyProperties(): { name: string, value: string }[] {
        return this.service.getTopologyProperties();
    }

    public loadNodeTemplates(): Observable<NodeTemplate[]> {
        return this.service.loadNodeTemplates();
    }

    public loadNodeTemplateInterfaces(nodeTemplate: NodeTemplate): Observable<string[]> {
        return this.service.loadNodeTemplateInterfaces(nodeTemplate);
    }

    public loadNodeTemplateOperations(nodeTemplate: NodeTemplate, interfaceName: string): Observable<string[]> {
        return this.service.loadNodeTemplateOperations(nodeTemplate, interfaceName);
    }

    public loadNodeTemplateOperationParameter(nodeTemplate: NodeTemplate, interfaceName: string,
        operation: string): Observable<any> {
        return this.service.loadNodeTemplateOperationParameter(nodeTemplate, interfaceName, operation);
    }

    public getBackendType(): string {
        return this.service.getBackendType();
    }

    private createBackendService() {
        this.settingService.getSetting().subscribe(response => {
            let serviceType = response.BackendType;
            this.service = new SdcService(this.broadcastService, this.noticeService, this.httpService, this.translate);
            this.broadcastService.broadcast(this.broadcastService.backendServiceReady, null);
        })
    }
}
