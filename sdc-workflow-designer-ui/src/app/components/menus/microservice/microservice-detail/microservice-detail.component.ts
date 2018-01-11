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

import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { Swagger } from "../../../../model/swagger";
import { RestConfig } from '../../../../model/rest-config';
import { RestService } from '../../../../services/rest.service';

/**
 * toolbar component contains some basic operations(save) and all of the supported workflow nodes.
 * The supported nodes can be dragged to container component. which will add a new node to the workflow.
 */
@Component({
    selector: 'b4t-microservice-detail',
    templateUrl: 'microservice-detail.component.html',
})
export class MicroserviceDetailComponent implements OnChanges {
    @Input() microservice: RestConfig;

    public detail: string;
    public dynamic = false;

    constructor(private configService: RestService) {
    }

    public ngOnChanges() {
        if(this.microservice == null) {
            this.microservice = new RestConfig('', '', null, '');
        }
        this.checkDynamic();
        this.parseSwagger2String();
    }

    private checkDynamic() {
        if(this.microservice.url) {
            this.dynamic = true;
        } else {
            this.dynamic = false;
        }
    }

    private parseSwagger2String() {
        if (this.microservice.swagger) {
            this.detail = JSON.stringify(this.microservice.swagger);
        } else {
            this.detail = '';
        }
    }

    public onDetailChanged(detail: string) {
        try {
            if(detail) {
                const swagger = new Swagger(JSON.parse(detail));
                this.detail = detail;
                console.log(swagger);
                this.microservice.swagger = swagger;
            } else {
                this.detail = '';
                this.microservice.swagger = null;
            }
        } catch (e) {
            // if detail is not a json object, then not change the swagger
        }
    }

    public toggleDynamic(dynamic: boolean) {
        this.dynamic = dynamic;
        this.onDetailChanged(null);

        if(!dynamic) {
            this.microservice.url = null;
        }
    }

    private loadDynamicInfo() {
        this.configService.getDynamicSwaggerInfo(this.microservice.url)
        .subscribe(response => {
            try {
                this.microservice.swagger = response;
                this.parseSwagger2String();
            } catch (e) {
                console.log('detail transfer error');
                console.error(e);
            }
        });
    }
}
