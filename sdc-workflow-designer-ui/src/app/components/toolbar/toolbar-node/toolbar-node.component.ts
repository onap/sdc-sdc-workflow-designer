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
import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { NodeTypeService } from "../../../services/node-type.service";
import { DisplayInfoService } from "../../../services/display-info.service";
import { NodeDataType } from "../../../model/node-data-type/node-data-type";
import { NodeType } from "../../../model/workflow/node-type.enum";
import { JsPlumbService } from "../../../services/jsplumb.service";
import { SettingService } from "../../../services/setting.service";
import { WorkflowUtil } from "../../../util/workflow-util";

@Component({
    selector: 'wfm-toolbar-node',
    templateUrl: 'toolbar-node.component.html',
    styleUrls: ['../toolbar.component.css']
})
export class ToolbarNodeComponent implements OnInit {
    public nodeCategories: any[] = [];
    public nodeTypeEnum = NodeType;
    public supportRest: boolean;

    private needInitButton = false;

    constructor(private nodeTypeService: NodeTypeService,
        private displayInfoService: DisplayInfoService,
        private jsPlumbService: JsPlumbService,
        private settingService: SettingService,
        public translate: TranslateService) {

    }

    public ngOnInit(): void {
        this.settingService.getSetting().subscribe(setting => {
            this.initSetting(setting);
            this.displayInfoService.getDisplayInfo().subscribe(resp => {
                this.initNodeCategories(resp);
                this.needInitButton = true;
            });
        });
    }

    public ngAfterViewChecked(): void {
        if (this.needInitButton) {
            console.log('initJsPlumb');
            this.initJsPlumb();
            this.needInitButton = false;
        }
    }

    private initSetting(setting: any): void {
        this.supportRest = setting.supportRestNode;
    }

    private initJsPlumb(): void {
        this.jsPlumbService.buttonDraggable();
        this.jsPlumbService.buttonDroppable();
    }

    private initNodeCategories(displayInfo: any): void {
        const defaultCategory = this.insertDefaultCategory();

        const categoryData = displayInfo['categoryData'] || {};
        for (let key in categoryData) {
            const group = {
                id: key,
                displayName: categoryData[key].displayName,
                collapse: categoryData[key].collapse || false,
                nodes: []
            };
            this.nodeCategories.push(group);
        }

        const defaultNodes = displayInfo['nodes'] || {};
        for (let nodeId in defaultNodes) {
            const nodeType = this.nodeTypeService.getNodeDataTypeById(nodeId);
            const node = defaultNodes[nodeId];
            if (node && node.category) {
                const nodeCategory = this.nodeCategories.find(category => category.id === node.category);
                if (nodeCategory) {
                    nodeCategory.nodes.push(nodeType);
                } else {
                    defaultCategory.nodes.push(nodeType);
                }
            } else {
                defaultCategory.nodes.push(nodeType);
            }
        }
    }

    private insertDefaultCategory(): any {
        this.nodeCategories = [];
        const defaultCategory = {
            id: 'default',
            displayName: {
                zh_CN: '任务',
                en_US: 'Task'
            },
            collapse: true,
            nodes: []
        };
        this.nodeCategories.push(defaultCategory);

        return defaultCategory;
    }

    public getDisplayName(data: any): string {
        let language = 'zh_CN';
        if (this.translate.currentLang.indexOf('en') > -1) {
            language = 'en_US';
        }
        return data.displayName ? data.displayName[language] : data.id;
    }

    public getImageUrl(nodeType: NodeDataType): string {
        const name = nodeType && nodeType.icon ? nodeType.icon.name : '';
        return WorkflowUtil.GetIconFullPath(name);
    }
}