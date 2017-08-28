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

import { Component, AfterViewInit } from '@angular/core';
import { JsPlumbService } from "./services/jsplumb.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
    constructor(private jsplumbService: JsPlumbService) {}

    public nodes = [
        {
            id: '001',
            name: 'node001',
            top: 50,
            left: 50,
        },
        {
            id: '002',
            name: 'node002',
            top: 250,
            left: 50,
        },
        {
            id: '003',
            name: 'node003',
            top: 140,
            left: 450,
        },
    ];

    ngAfterViewInit(): void {
        this.jsplumbService.initJsPlumbInstance();
        this.jsplumbService.initNode('.node');
    }
}
