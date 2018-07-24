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
import { Component, OnInit, ViewChild } from '@angular/core';

import { BroadcastService } from '../../services/broadcast.service';
import { ModelService } from '../../services/model.service';
import { RestConfigComponent } from './rest-config/rest-config.component';
import { AuthService } from '../../services/auth.service';
import { InterfaceService } from '../../services/interface.service';
import { ActivatedRoute } from '@angular/router/';
import { PlxModal } from "../../paletx/plx-modal/modal";

@Component({
  selector: 'menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css']
})
export class MenusComponent implements OnInit {
  @ViewChild(RestConfigComponent) public restConfigComponent: RestConfigComponent;

  public name = '';
  public canSave = true;
  public hasRight = false;

  constructor(private activatedRoute: ActivatedRoute, private modelService: ModelService,
    private broadcastService: BroadcastService, private authService: AuthService,
    private plxModal: PlxModal) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      let operation: string = queryParams.operation;
      // default value is 'modify', which means save button is enabled.
      this.canSave = null == operation || 'view' != operation.toLowerCase();
    });
    this.broadcastService.initModel.subscribe(planModel => {
      this.name = planModel.name;
    });
    this.broadcastService.saveRight$.subscribe(saveRight => {
      this.hasRight = saveRight;
    });
    // checkRights
    this.authService.checkRights();
  }

  public save(): void {
    this.modelService.save();
  }

  public back(): void {
    history.back();
  }

  public checkBack(component: any): void {
    if (this.modelService.isModify()) {
      this.plxModal.open(component, { size: 'sm' });
    } else {
      this.back();
    }
  }

  public saveBack(): void {
    this.modelService.save(this.back);
  }

  public showRestConfigModal(): void {
    this.restConfigComponent.show();
  }

}
