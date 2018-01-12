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
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AlertModule, ModalModule } from 'ngx-bootstrap/index';
import { NgxTreeSelectModule } from 'ngx-tree-select';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { ContainerComponent } from './components/container/container.component';
import { EditablePropertyComponent } from './components/editable-property/editable-property.component';
import { NodeParametersComponent } from './components/node-parameters/node-parameters.component';
import { ParameterTreeComponent } from './components/node-parameters/parameter-tree/parameter-tree.component';
import { NodeComponent } from './components/node/node.component';
import { ParameterComponent } from './components/parameter/parameter.component';
import { IntermediateCatchEventComponent } from './components/property/intermediate-catch-event/intermediate-catch-event.component';
import { NodeTemplateComponent } from './components/property/node-template/node-template.component';
import { PropertiesComponent } from './components/property/properties.component';
import { RestTaskComponent } from './components/property/rest-task/rest-task.component';
import { ErrorEventComponent } from './components/property/error-event/error-event.component';
import { StartEventComponent } from './components/property/start-event/start-event.component';
import { SequenceFlowComponent } from './components/sequence-flow/sequence-flow.component';
import { RestConfigDetailComponent } from './components/menus/rest-config/rest-config-detail/rest-config-detail.component';
import { RestConfigListComponent } from './components/menus/rest-config/rest-config-list/rest-config-list.component';
import { RestConfigComponent } from './components/menus/rest-config/rest-config.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

import { ResizableDirective } from './directive/resizable/resizable.directive';

import { BroadcastService } from './services/broadcast.service';
import { DataService } from './services/data/data.service';
import { JsPlumbService } from './services/jsplumb.service';
import { ModelService } from './services/model.service';
import { NoticeService } from './services/notice.service';
import { RestService } from './services/rest.service';
import { SwaggerTreeConverterService } from './services/swagger-tree-converter.service';
import { SettingService } from './services/setting.service';

import { SharedModule } from './shared/shared.module';
import { HttpService } from './util/http.service';
import { GlobalNoticeComponent } from './components/global-notice/global-notice.component';
import { MenusComponent } from './components/menus/menus.component';
import { ScriptTaskComponent } from "./components/property/script-task/script-task.component";
import { WorkflowsComponent } from './components/menus/workflows/workflows.component';
import { WorkflowService } from './services/workflow.service';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './services/data/in-memory-data.service';
import { HttpModule } from '@angular/http';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        ContainerComponent,
        EditablePropertyComponent,
        ErrorEventComponent,
        IntermediateCatchEventComponent,
        NodeComponent,
        NodeParametersComponent,
        NodeTemplateComponent,
        ParameterComponent,
        ParameterTreeComponent,
        PropertiesComponent,
        RestConfigComponent,
        RestTaskComponent,
        SequenceFlowComponent,
        ScriptTaskComponent,
        StartEventComponent,
        ToolbarComponent,
        RestConfigDetailComponent,
        RestConfigListComponent,
        ResizableDirective,
        GlobalNoticeComponent,
        MenusComponent,
        WorkflowsComponent,
    ],
    providers: [
        BroadcastService,
        HttpService,
        JsPlumbService,
        ModelService,
        NoticeService,
        RestService,
        SwaggerTreeConverterService,
	DataService,
        SettingService,
        WorkflowService
    ],
    imports: [
        AccordionModule.forRoot(),
        AlertModule.forRoot(),
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
        }),
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    bootstrap: [
        AppComponent,
    ],
})
export class AppModule {

}
