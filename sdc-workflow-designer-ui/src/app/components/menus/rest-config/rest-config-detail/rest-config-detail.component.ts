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

import { Component, Input, OnChanges } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { Swagger } from '../../../../model/swagger';
import { RestConfig } from '../../../../model/rest-config';
import { RestService } from '../../../../services/rest.service';

/**
 * toolbar component contains some basic operations(save) and all of the supported workflow nodes.
 * The supported nodes can be dragged to container component. which will add a new node to the workflow.
 */
@Component({
    selector: 'b4t-rest-config-detail',
    templateUrl: 'rest-config-detail.component.html',
})
export class RestConfigDetailComponent implements OnChanges {
    @Input() restConfig: RestConfig;

    public detail: string;

    constructor(private restService: RestService) {
    }

    public ngOnChanges() {
        if (this.restConfig == null) {
            this.restConfig = new RestConfig('', '', '', '', '');
        }
        this.parseSwagger2String();
    }

    private parseSwagger2String() {
        if (this.restConfig.swagger) {
            this.detail = JSON.stringify(this.restConfig.swagger);
        } else {
            this.detail = '';
        }
    }

    public onDetailChanged(detail: string) {
        this.detail = detail;

        let swagger: Swagger = null;
        try {
            swagger = new Swagger(JSON.parse(detail));
            console.log(swagger);
        } catch (e) {
            console.log('detail transfer error');
            console.error(e);
        }
        this.restConfig.swagger = swagger;
    }

    public toggleDynamic(dynamic: boolean) {
        // this.restConfig.dynamic = dynamic;

        // if (this.restConfig.dynamic && this.restConfig.definition) {
        //     this.restService.getDynamicSwaggerInfo(this.restConfig.definition)
        //         .subscribe(response => {
        //             try {
        //                 this.restConfig.swagger = new Swagger(response);
        //                 this.parseSwagger2String();
        //             } catch (e) {
        //                 console.log('detail transfer error');
        //                 console.error(e);
        //             }

        //         });
        // }
    }

}
