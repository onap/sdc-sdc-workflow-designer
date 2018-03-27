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
import { Http } from '@angular/http';
import { BroadcastService } from './broadcast.service';

@Injectable()
export class AuthService {
  private static AuthUrl = "/api/oauth2/v1/perms/user/operations";
  private static AllOperations = ["operation.apds.create", "operation.apds.delete", "operation.apds.modify",
    "operation.apds.view", "operation.apds.import", "operation.apds.export", "operation.apds.deploy",
    "operation.apds.test"];
  private static ModifyOperation = 'operation.apds.modify';

  constructor(private http: Http, private broadcastService: BroadcastService) {
    this.checkRights();
    // keep alive
    // setInterval(() => {
    //   console.log(`Keep session alive. Request per 3 minutes. ${new Date()}`);
    //   this.checkRights();
    // }, 180000);
  }
  public checkRights() {
    // let data = { operations: AuthService.AllOperations };
    // this.http.post(AuthService.AuthUrl, data).subscribe(res => {
    //   let hasRightOP = res.json().operations;
    //   if (hasRightOP.length > 0) {
    //     this.broadcastService.broadcast(this.broadcastService.openRight, true);
    //     if (hasRightOP.indexOf(AuthService.ModifyOperation) > -1) {
    //       this.broadcastService.broadcast(this.broadcastService.saveRight, true);
    //     } else {
    //       this.broadcastService.broadcast(this.broadcastService.saveRight, false);
    //     }
    //   } else {
    //     this.broadcastService.broadcast(this.broadcastService.openRight, false);
    //     this.broadcastService.broadcast(this.broadcastService.saveRight, false);
    //   }
    // }, error => {
    //   switch (error.status) {
    //     // Incase oauth service not exists or operation set not exists
    //     case 404:
    //     case 501:
    //     case 502:
    //       this.broadcastService.broadcast(this.broadcastService.openRight, true);
    //       this.broadcastService.broadcast(this.broadcastService.saveRight, true);
    //       break;
    //     default:
    //       this.broadcastService.broadcast(this.broadcastService.openRight, false);
    //       this.broadcastService.broadcast(this.broadcastService.saveRight, false);
    //       break;
    //   }
    // });
    this.broadcastService.broadcast(this.broadcastService.openRight, true);
    this.broadcastService.broadcast(this.broadcastService.saveRight, true);
  }
}
