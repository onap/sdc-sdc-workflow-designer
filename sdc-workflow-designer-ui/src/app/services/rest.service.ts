/*******************************************************************************
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 *******************************************************************************/

import { Injectable } from '@angular/core';
import { Http, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { SwaggerMethod } from '../model/swagger';
import { SwaggerResponse } from '../model/swagger';
import { Swagger, SwaggerSchemaObject } from '../model/swagger';
import { RestConfig } from '../model/rest-config';
import { HttpService } from '../util/http.service';
import { BroadcastService } from './broadcast.service';
import { NoticeService } from './notice.service';

@Injectable()
export class RestService {

    private restConfigs: RestConfig[] = [];
    private runtimeURL = '/openoapi/catalog/v1/sys/config';
    private msbPublishServiceURL = '/api/msdiscover/v1/publishservicelist';

    constructor(private broadcastService: BroadcastService, private http: Http, private noticeService: NoticeService) {
        this.broadcastService.planModel$.subscribe(planModel => {
            planModel.configs.restConfigs.forEach(element => {
                this.restConfigs.push(element);
            });
        });
        // this.initSwaggerInfoByMSB();
    }

    // public addRestConfig(): RestConfig {
    //     let index = 0;
    //     this.restConfigs.forEach(config => {
    //         const currentId = parseInt(config.id);
    //         if (currentId > index) {
    //             index = currentId;
    //         }
    //     });

    //     index += 1;

    //     const restConfig = new RestConfig(index.toString(), 'new Config', '', '', false);
    //     this.restConfigs.push(restConfig);

    //     return restConfig;
    // }

    // public initSwaggerInfo(restConfig: RestConfig) {
    //     if (restConfig.dynamic && restConfig.definition) {
    //         this.getDynamicSwaggerInfo(restConfig.definition).subscribe(response => restConfig.swagger = new Swagger(response));
    //     } else {
    //         restConfig.swagger = new Swagger(restConfig.swagger);
    //     }
    // }

    public getRestConfigs() {
        return this.restConfigs;
    }

    public getDynamicSwaggerInfo(url: string): Observable<any> {
        const options: any = {
            headers: {
                Accept: 'application/json',
            },
        };
        return this.http.get(url, options);
    }

    public getSwaggerInfo(id: string): Swagger {
        const restConfig = this.restConfigs.find(tmp => tmp.id === id);
        return restConfig === undefined ? undefined : restConfig.swagger;
    }

    public getResponseParameters(swagger: Swagger, interfaceUrl: string, operation: string): SwaggerResponse[] {
        const path = swagger.paths[interfaceUrl];
        const method: SwaggerMethod = path[operation];
        let responses: SwaggerResponse[] = [];

        for (const key of Object.keys(method.responses)) {
            if (key.startsWith('20') && method.responses[key].schema && method.responses[key].schema.$ref) {
                let response: SwaggerResponse = method.responses[key];
                responses.push(response);
            }
        }

        return responses;
    }

    public getDefinition(swagger: Swagger, position: string): SwaggerSchemaObject {
        const definitionName = position.substring('#/definitions/'.length);

        return swagger.definitions[definitionName];
    }

    private initSwaggerInfoByMSB(): void {
        const options: any = {
            headers: {
                Accept: 'application/json',
            }
        };
        let restConfigs = this.restConfigs;
        this.http.get(this.runtimeURL).subscribe(runtimeResponse => {
            const tenant = runtimeResponse.json().tenant;
            console.log('Current namespace is:' + tenant);
            this.http.get(this.msbPublishServiceURL, { params: { namespace: tenant } }).subscribe(serviceResponse => {
                if (!Array.isArray(serviceResponse.json())) {
                    return;
                }
                const services = serviceResponse.json();
                const protocel = location.protocol.slice(0, location.protocol.length - 1);
                const swaggerObservableArray: Observable<any>[] = [];
                services.forEach(serviceInfo => {
                    if ('REST' === serviceInfo.protocol && protocel === serviceInfo.publish_protocol) {
                        // this service don't have sawgger file.
                        if ('/activiti-rest' !== serviceInfo.publish_url) {
                            const id = serviceInfo.serviceName + '.' + serviceInfo.version;
                            restConfigs.push(new RestConfig(id, serviceInfo.serviceName, serviceInfo.version, serviceInfo.publish_url));
                            let swaggerUrl = '';
                            if (undefined !== serviceInfo.swagger_url && '' !== serviceInfo.swagger_url) {
                                swaggerUrl = serviceInfo.publish_url + '/' + serviceInfo.swagger_url;
                            } else {
                                // default swagger url is: '/swagger.json'
                                swaggerUrl = serviceInfo.publish_url + '/swagger.json';
                            }
                            swaggerObservableArray.push(this.http.get(swaggerUrl, options).timeout(5000).catch((error): Observable<any> => {
                                console.log('Request swagger from:"' + swaggerUrl + '" faild!');
                                return Observable.of(null);
                            }));
                        }
                    }
                });
                Observable.forkJoin(swaggerObservableArray).subscribe(
                    responses => {
                        let deleteArray: number[] = [];
                        responses.forEach((response, index) => {
                            // mark http get failed request index or set the swagger into restConfigs
                            if (null === response) {
                                deleteArray.push(index);
                            } else {
                                try {
                                    const swagger = response.json();
                                    restConfigs[index].swagger = new Swagger(swagger);
                                } catch (e) {
                                    deleteArray.push(index);
                                    console.warn('Do not support this sawgger file format:' + response.text());
                                }
                            }
                        });
                        console.log('Get all swagger file finish.');
                        // delete failed request from all restConfigs array
                        deleteArray.reverse();
                        deleteArray.forEach(deleteIndex => {
                            restConfigs.splice(deleteIndex, 1);
                        });
                        this.broadcastService.broadcast(this.broadcastService.updateModelRestConfig, restConfigs);
                        console.log('Load all swagger finished.');
                    }
                );
            });
        });
    }
}

