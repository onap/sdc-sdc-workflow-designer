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
import { ActivatedRoute } from '@angular/router/';

import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';

import { HttpService } from '../util/http.service';
import { BroadcastService } from './broadcast.service';
import { NoticeService } from './notice.service';
import { PlanModel } from '../model/plan-model';

@Injectable()
export class InterfaceService {
  private static ModelUrl = '/api/workflow-modeler/v1/models/';
  constructor(private activatedRoute: ActivatedRoute, private http: HttpService,
    private broadcast: BroadcastService, private notice: NoticeService, private translate: TranslateService) {
    this.getModelData();
  }

  public getModelData() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      let modelId = queryParams.id;
      this.http.get(InterfaceService.ModelUrl + modelId).subscribe(data => {
        this.broadcast.broadcast(this.broadcast.initModel, data);
      }, error => {
        this.translate.get('WORKFLOW.MSG.LOAD_FAIL').subscribe((res: string) => {
          this.notice.error(res);
        });
      });
    });
  }

  public saveModelData(planModel: PlanModel): Observable<PlanModel> {
    return this.http.put(InterfaceService.ModelUrl + planModel.id, planModel);
  }
}
