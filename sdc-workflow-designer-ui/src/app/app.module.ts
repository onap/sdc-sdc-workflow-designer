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
import { NgxTreeSelectModule } from 'ngx-tree-select';

import { AppComponent } from './app.component';
import { JsPlumbService } from "./services/jsplumb.service";
import { NodeComponent } from "./components/node/node.component";
import { ToolbarComponent } from "./components/toolbar/toolbar.component";
import { WorkflowService } from "./services/workflow.service";
import { DataAccessService } from "./services/data-access/data-access.service";
import { HttpService } from "./util/http.service";
import { SharedModule } from "./shared/shared.module";
import { InMemoryWebApiModule } from "angular-in-memory-web-api";
import { InMemoryDataService } from "./services/data-access/in-memory-data.service";
import { HttpModule } from "@angular/http";
import { RouterModule } from "@angular/router";
import { BroadcastService } from "./services/broadcast.service";
import { PropertiesComponent } from "./components/property/properties.component";
import { CanvasComponent } from "./components/canvas/canvas.component";
import { StartEventParametersComponent } from "./components/property/start-event-parameters/start-event-parameters.component";
import { ParameterComponent } from "./components/parameter/parameter.component";
import { MenuComponent } from "./components/menu/menu.component";
import { MicroserviceDetailComponent } from "./components/menu/microservice/microservice-detail/microservice-detail.component";
import { MicroserviceComponent } from "./components/menu/microservice/microservice.component";
import { MicroserviceListComponent } from "./components/menu/microservice/microservice-list/microservice-list.component";
import { ModalModule } from "ngx-bootstrap/modal";
import { WorkflowConfigService } from "./services/workflow-config.service";
import { RestTaskComponent } from "./components/property/rest-task/rest-task.component";
import { RestTaskParametersComponent } from "./components/property/rest-task/rest-task-parameters/rest-task-parameters.component";
import { ParameterTreeComponent } from "./components/parameter-tree/parameter-tree.component";
import { EditablePropertyComponent } from "./components/editable-property/editable-property.component";
import { SwaggerTreeConverterService } from "./services/swagger-tree-converter.service";
import { WorkflowProcessService } from "./services/workflow-process.service";
import { IntermediateCatchEventComponent } from "./components/property/intermediate-catch-event/intermediate-catch-event.component";

@NgModule({
    declarations: [
        AppComponent,
        CanvasComponent,
        EditablePropertyComponent,
        IntermediateCatchEventComponent,
        MenuComponent,
        MicroserviceComponent,
        MicroserviceDetailComponent,
        MicroserviceListComponent,
        NodeComponent,
        ParameterComponent,
        ParameterTreeComponent,
        PropertiesComponent,
        RestTaskComponent,
        RestTaskParametersComponent,
        StartEventParametersComponent,
        ToolbarComponent,
    ],
    imports: [
        BrowserModule,
        HttpModule,
        InMemoryWebApiModule.forRoot(InMemoryDataService),
        ModalModule.forRoot(),
        RouterModule.forRoot([]),
        SharedModule,
        NgxTreeSelectModule.forRoot({
            allowFilter: true,
            filterPlaceholder: 'Type your filter here...',
            maxVisibleItemCount: 5,
            idField: 'id',
            textField: 'name',
            childrenField: 'children',
            allowParentSelection: false
        })
    ],
    providers: [
        BroadcastService,
        DataAccessService,
        HttpService,
        JsPlumbService,
        SwaggerTreeConverterService,
        WorkflowConfigService,
        WorkflowProcessService,
        WorkflowService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
