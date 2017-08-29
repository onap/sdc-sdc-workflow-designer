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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { JsPlumbService } from "./services/jsplumb.service";
import { NodeComponent } from "./components/node/node.component";
import { ToolbarComponent } from "./components/toolbar/toolbar.component";
import { WorkflowService } from "./services/workflow.service";

@NgModule({
    declarations: [
        AppComponent,
        NodeComponent,
        ToolbarComponent,
    ],
    imports: [
        BrowserModule
    ],
    providers: [JsPlumbService, WorkflowService],
    bootstrap: [AppComponent]
})
export class AppModule { }
