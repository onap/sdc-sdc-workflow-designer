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

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxTreeSelectModule } from 'ngx-tree-select';

import { AccordionModule } from 'ngx-bootstrap/accordion';

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
import { StartEventParametersComponent } from "./components/property/start-event-parameters/start-event-parameters.component";
import { ParameterComponent } from "./components/parameter/parameter.component";
import { MenusComponent } from "./components/menus/menus.component";
import { MicroserviceDetailComponent } from "./components/menus/microservice/microservice-detail/microservice-detail.component";
import { MicroserviceComponent } from "./components/menus/microservice/microservice.component";
import { MicroserviceListComponent } from "./components/menus/microservice/microservice-list/microservice-list.component";
import { ModalModule } from "ngx-bootstrap/modal";
import { WorkflowConfigService } from "./services/workflow-config.service";
import { RestTaskComponent } from "./components/property/rest-task/rest-task.component";
import { EditablePropertyComponent } from "./components/editable-property/editable-property.component";
import { SwaggerTreeConverterService } from "./services/swagger-tree-converter.service";
import { IntermediateCatchEventComponent } from "./components/property/intermediate-catch-event/intermediate-catch-event.component";
import { SequenceFlowComponent } from "./components/sequence-flow/sequence-flow.component";
import { ScriptTaskComponent } from "./components/property/script-task/script-task.component";
import { WorkflowsComponent } from "./components/menus/workflows/workflows.component";
import { ModelService } from './services/model.service';
import { ContainerComponent } from './components/container/container.component';
import { RestService } from './services/rest.service';
import { ResizableDirective } from './directive/resizable/resizable.directive';
import { StartEventComponent } from './components/property/start-event/start-event.component';
import { NodeParametersComponent } from './components/node-parameters/node-parameters.component';
import { ParameterTreeComponent } from './components/node-parameters/parameter-tree/parameter-tree.component';

@NgModule({
    declarations: [
        AppComponent,
        ContainerComponent,
        ResizableDirective,
        EditablePropertyComponent,
        IntermediateCatchEventComponent,
        MenusComponent,
        MicroserviceComponent,
        MicroserviceDetailComponent,
        MicroserviceListComponent,
        NodeComponent,
        NodeParametersComponent,
        ParameterComponent,
        ParameterTreeComponent,
        PropertiesComponent,
        RestTaskComponent,
        ScriptTaskComponent,
        StartEventComponent,
        SequenceFlowComponent,
        StartEventParametersComponent,
        ToolbarComponent,
        WorkflowsComponent,
    ],
    providers: [
        BroadcastService,
        DataAccessService,
        HttpService,
        JsPlumbService,
	ModelService,
        RestService,
        SwaggerTreeConverterService,
        WorkflowConfigService,

        WorkflowService
    ],
    imports: [
        AccordionModule.forRoot(),
        BrowserAnimationsModule,
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
    bootstrap: [
    	AppComponent,
    ],
})
export class AppModule {
}
