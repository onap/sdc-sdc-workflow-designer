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
import { Observable } from "rxjs/Rx";

import { NodeTemplate } from '../model/topology/node-template';
import { SettingService } from './setting.service';
import { HttpService } from '../util/http.service';
import { BroadcastService } from './broadcast.service';

@Injectable()
export class ToscaService {
  private nodeTemplate: NodeTemplate[] = [];
  private topologyProperties: {
    name: string;
    value: string;
  }[] = [];
  private namespace;
  private serviceTemplateId;
  private repositoryURL;
  constructor(private settingService: SettingService, private httpService: HttpService,
    private broadcastService: BroadcastService) {
    this.settingService.getSetting().subscribe(setting => {
      if (true === setting.supportToscaNode) {
        // todo: need to load tosca interface and tosca properties
        this.initTOSCAInfo();
      } else {
        this.broadcastService.broadcast(this.broadcastService.updateModelToscaConfig, null);
      }
    });
  }

  public getNodeTemplate(): NodeTemplate[] {
    return this.nodeTemplate;
  }

  public getTopologyProperties() {
    return this.topologyProperties;
  }

  public initTOSCAInfo() {
    this.getNodeTemplates().subscribe(nodes => {
      if (0 === nodes.length) {
        return;
      }

      const subscribes = nodes.map(node => this.loadTopologyProperties(node));
      Observable.forkJoin(subscribes).map(nodesProperties => {
        const allProperties: { name: string, value: string }[] = [];
        nodesProperties.forEach((properties, index) => {
          properties.forEach(property => {
            // allProperties.push(nodes[index].name + '.' + property);
            const propertyOption = {
              name: `${nodes[index].name}.${property}`,
              value: `[${nodes[index].name}].[${property}]`
            };
            allProperties.push(propertyOption);
          });
        });
        return allProperties;
      }).subscribe(allProperties => {
        this.topologyProperties = allProperties;
        this.broadcastService.broadcast(this.broadcastService.updateModelToscaConfig, this.topologyProperties);
      });
    });
  }

  public getNodeTemplates(): Observable<NodeTemplate[]> {
    const url = 'servicetemplates/' + this.encode(this.namespace)
      + '/' + this.encode(this.serviceTemplateId) + '/topologytemplate/';

    return this.httpService.get(this.getFullUrl(url)).map(response => {
      const nodeTemplates = [];
      for (const key in response.nodeTemplates) {
        if (response.nodeTemplates.hasOwnProperty(key)) {
          const nodeTemplate = response.nodeTemplates[key];
          nodeTemplates.push({
            id: nodeTemplate.id,
            type: nodeTemplate.type.replace(/^\{(.+)\}(.+)/, '$2'),
            name: nodeTemplate.name,
            namespace: nodeTemplate.type.replace(/^\{(.+)\}(.+)/, '$1'),
          });
        }
      }
      return nodeTemplates;
    });
  }

  public loadTopologyProperties(nodeTemplate: NodeTemplate): Observable<string[]> {
    const url = 'nodetypes/' + this.encode(nodeTemplate.namespace)
      + '/' + this.encode(nodeTemplate.type) + '/propertiesdefinition/winery/list/';

    return this.httpService.get(this.getFullUrl(url)).map(properties =>
      properties.map(property => property.key));
  }

  public loadNodeTemplateInterfaces(nodeTemplate: NodeTemplate): Observable<string[]> {
    const url = 'nodetypes/' + this.encode(nodeTemplate.namespace)
      + '/' + this.encode(nodeTemplate.type) + '/interfaces/';

    return this.httpService.get(this.getFullUrl(url));
  }
  public loadNodeTemplateOperations(nodeTemplate: NodeTemplate,
    interfaceName: string): Observable<string[]> {
    const url = 'nodetypes/' + this.encode(nodeTemplate.namespace)
      + '/' + this.encode(nodeTemplate.type) + '/interfaces/' + this.encode(interfaceName) + '/operations/';

    return this.httpService.get(this.getFullUrl(url));
  }

  public loadNodeTemplateOperationParameter(nodeTemplate: NodeTemplate,
    interfaceName: string,
    operation: string): Observable<any> {
    const relativePath = 'nodetypes/' + this.encode(nodeTemplate.namespace) + '/' + this.encode(nodeTemplate.type)
      + '/interfaces/' + this.encode(interfaceName) + '/operations/' + this.encode(operation) + '/';

    // input parameters
    const inputObservable = this.httpService
      .get(this.getFullUrl(relativePath + 'inputparameters'));

    // output parameters
    const outputObservable = this.httpService
      .get(this.getFullUrl(relativePath + 'outputparameters'));

    return Observable.forkJoin([inputObservable, outputObservable]).map(params => {
      return {
        input: params[0],
        output: params[1],
      };
    });
  }

  private decode(param: string): string {
    return decodeURIComponent(decodeURIComponent(param));
  }

  private encode(param: string): string {
    return encodeURIComponent(encodeURIComponent(param));
  }

  private getFullUrl(relativePath: string) {
    return this.repositoryURL + relativePath;
  }
}
