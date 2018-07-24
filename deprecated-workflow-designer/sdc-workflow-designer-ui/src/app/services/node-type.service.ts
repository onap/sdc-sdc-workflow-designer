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
import { Injectable } from "@angular/core";
import { HttpService } from "../util/http.service";
import { BroadcastService } from "./broadcast.service";
import { NodeDataType } from "../model/node-data-type/node-data-type";
import { Parameter } from "../model/workflow/parameter";
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class NodeTypeService {
    private nodeDataTypes: NodeDataType[] = [];
    private nodeDataTypeUrl = '/api/workflow-modeler/v1/ext-activities?sence=test';

    constructor(private httpService: HttpService, private translateService: TranslateService,
        private broadcastService: BroadcastService) {
        this.initNodeDataTypes();
    }

    private initNodeDataTypes(): void {
        this.httpService.get(this.nodeDataTypeUrl)
            .toPromise()
            .then(resp => {
                if (resp && 0 < resp.length) {
                    this.nodeDataTypes = resp;
                }
                this.broadcastService.broadcast(this.broadcastService.updateNodeTypeConfig, null);
            });
    }

    public getAllNodeDataTypes(): NodeDataType[] {
        return this.nodeDataTypes;
    }

    public getNodeDataTypeById(id: string): NodeDataType | null {
        return this.nodeDataTypes.find(nodeDataType => nodeDataType.id === id);
    }

    public GetI18nName(key: string, displayName: any): string {
        //todo: add logic
        let name = key;
        if (displayName) {
            let language = 'zh_CN';
            if (this.translateService.currentLang.indexOf('en') > -1) {
                language = 'en_US';
            }
            if (displayName.language && '' != displayName.language) {
                name = displayName.language;
            }
        }
        return name;
    }

    public static GetParameterByDataType(nodeDataType: any): Parameter {
        //todo: add logic
        let param = new Parameter('', '', '');
        return param;
    }
}