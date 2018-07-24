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
import { Observable } from "rxjs";
import { ModelService } from "./model.service";

@Injectable()
export class DisplayInfoService {
    private displayInfoUrl = '/api/workflow-modeler/v1/ext-activities/displayInfo?scene=';

    constructor(private modelService: ModelService, private httpService: HttpService) {
    }

    public getDisplayInfo(): Observable<any> {
        return this.httpService.get(this.displayInfoUrl + this.modelService.getPlanModel().scene);
    }
}