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
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';

import { PlanModel } from '../../model/plan-model';
import { NodeTemplate } from '../../model/topology/node-template';
import { HttpService } from '../../util/http.service';
import { BroadcastService } from '../broadcast.service';
import { NoticeService } from '../notice.service';

/**
 * BackendService
 * provides backend data accessor to load and save data.
 */
@Injectable()
export abstract class BackendService {
    private topologyProperties: { name: string, value: string }[] = [];

    constructor(protected broadcastService: BroadcastService, protected noticeService: NoticeService,
        protected httpService: HttpService, private translate: TranslateService) {
        this.broadcastService.saveEvent$.subscribe(data => {
            this.save(data).subscribe(response => {
                this.translate.get('WORKFLOW.MSG.SAVE_SUCCESS').subscribe((res: string) => {
                    this.noticeService.success(res);
                });
            }, error => {
                this.noticeService.error(error);
            });
        });
    }

    public abstract loadPlans(): Observable<Map<number, any>>;

    public abstract getBackendType(): string;

    public abstract setParameters(params: any);

    public abstract loadNodeTemplates(): Observable<NodeTemplate[]>;

    public abstract loadTopologyProperties(nodeTemplate: NodeTemplate): Observable<string[]>;

    public abstract loadNodeTemplateInterfaces(nodeTemplate: NodeTemplate): Observable<string[]>;

    public abstract loadNodeTemplateOperations(nodeTemplate: NodeTemplate,
        interfaceName: string): Observable<string[]>;

    public abstract loadNodeTemplateOperationParameter(nodeTemplate: NodeTemplate,
        interfaceName: string,
        operation: string): Observable<any>;

    public abstract save(data: any): Observable<any>;

    public abstract loadPlan(): Observable<PlanModel>;

    public getTopologyProperties(): { name: string, value: string }[] {
        return this.topologyProperties;
    }

    public canEdit(): boolean {
        return true;
    }

    protected refreshTopologyProperties(): void {
        this.loadNodeTemplates().subscribe(nodes => {
            if (0 === nodes.length) {
                return;
            }

            const subscribes = nodes.map(node => this.loadTopologyProperties(node));
            Observable.forkJoin(subscribes).map(nodesProperties => {
                const allProperties: { name: string, value: string }[] = [];
                nodesProperties.forEach((properties, index) => {
                    properties.forEach(property => {
                        // allProperties.push(nodes[index].name + '.' + property);
                        const propertyOption = {
                            name: `${nodes[index].name}.${property}`,
                            value: `[${nodes[index].name}].[${property}]`
                        };
                        allProperties.push(propertyOption);
                    });
                });
                return allProperties;
            }).subscribe(allProperties => {
                this.topologyProperties = allProperties;
            });
        });
    }
}
