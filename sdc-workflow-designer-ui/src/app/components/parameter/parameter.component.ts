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

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {PlanTreeviewItem} from "../../model/plan-treeview-item";
import {ValueSource} from "../../model/value-source.enum";
import {Parameter} from "../../model/workflow/parameter";
import {ToscaService} from "../../services/tosca.service";
import {ValueType} from "../../model/value-type.enum";

/**
 * this component contains in property component if the corresponding node has parameter properties
 * eg. task node have input and output params, start event node has input param
 */
@Component({
    selector: 'wfm-parameter',
    styleUrls: ['./parameter.component.css'],
    templateUrl: 'parameter.component.html',
})
export class ParameterComponent implements OnInit {
    @Input() public param: Parameter;
    @Input() public valueSource: ValueSource[] = [];
    @Input() public showLabel: boolean;
    @Input() public showValue: boolean;
    @Input() public canEditName: boolean;
    @Input() public canEditValue: boolean;
    @Input() public canInsert: boolean;
    @Input() public canDelete: boolean;
    @Input() public planItems: PlanTreeviewItem[];
    @Output() paramChange = new EventEmitter<Parameter>();
    @Output() insert = new EventEmitter<Parameter>();
    @Output() delete = new EventEmitter<Parameter>();

    // Parameter setting
    public currentShowLabel: boolean;
    public currentShowValue: boolean;
    public currentCanEditName: boolean;
    public currentCanEditValue: boolean;
    public currentCanInsert: boolean;
    public currentCanDelete: boolean;

    public valueTypeEnum = ValueType;
    public valueSourceEnum = ValueSource;
    public sourceItems: { name: string, value: string }[] = [];
    public planOptions = [];
    public topologyOptions: { name: string, value: string }[] = [];
    public showValueValue = true;
    public showValueSource = true;
    public planValue: any = {};

    constructor(private toscaService: ToscaService) {
    }

    public ngOnInit(): void {
        this.initSetting();
        this.topologyOptions = this.toscaService.getTopologyProperties();
        this.initSourceItems();
        this.initPlanValue();
        this.setValueSource(this.param.valueSource);
        this.initPlanTreeViewItems(this.planItems);
    }

    private initSetting():void{
        this.currentShowLabel = this.setDefaultValue(this.showLabel, true);
        this.currentShowValue = this.setDefaultValue(this.showValue, true);
        this.currentCanEditName = this.setDefaultValue(this.canEditName, false);
        this.currentCanEditValue = this.setDefaultValue(this.canEditValue, true);
        this.currentCanInsert = this.setDefaultValue(this.canInsert, false);
        this.currentCanDelete = this.setDefaultValue(this.canDelete, false);
    }

    private setDefaultValue(param: boolean, value: boolean): boolean {
        return undefined === param ? value : param;
    }

    private initSourceItems(): void {
        this.sourceItems = [];
        if (this.param.type !== ValueType[ValueType.object] && this.param.type !== ValueType[ValueType.array]) {
            this.sourceItems = [{
                name: this.capitalizeFirstLetter(this.param.type),
                value: this.param.type
            }];
        }
        this.valueSource.forEach(value => {
            this.sourceItems.push({
                name: ValueSource[value],
                value: ValueSource[value]
            });
        });
    }

    private capitalizeFirstLetter(value: string): string {
        const firstLetter = value.substring(0, 1);
        const remainedLetter = value.substring(1);
        return firstLetter.toUpperCase() + remainedLetter;
    }

    private initPlanValue(): void {
        if (ValueSource[ValueSource.Plan] === this.param.valueSource) {
            this.planValue = {id: this.param.value};
        }
    }

    private setValueSource(valueSource: string): void {
        if (ValueSource[ValueSource.Definition] === valueSource) {
            this.showValueValue = false;
        } else {
            this.showValueValue = true;
        }
    }

    private initPlanTreeViewItems(planTreeviewItems: PlanTreeviewItem[]): void {
        this.planOptions = this.getTreeViewChild(planTreeviewItems);
    }

    private getTreeViewChild(planTreeviewItems: PlanTreeviewItem[]): any[] {
        let treeviewItems = [];
        if (undefined == planTreeviewItems || 0 === planTreeviewItems.length) {
            // todo: debug check if it need [] or undefined.
            return treeviewItems;
        }
        planTreeviewItems.forEach(item => {
            const treeviewItem = {
                id: item.value,
                name: item.name,
                disabled: false,
                // !item.canSelect,
                children: this.getTreeViewChild(item.children)
            };
            treeviewItems.push(treeviewItem);
        });
        return treeviewItems;
    }

    public keyChange(key: string) {
        this.param.name = key;
        this.paramChange.emit(this.param);
    }

    private formatValue(value: any) {
        let result;
        switch (this.param.valueSource) {
            case ValueSource[ValueSource.boolean]:
                result = value === "true" ? true : false;
                break;
            case ValueSource[ValueSource.integer]:
                result = parseInt(value);
                break;
            case ValueSource[ValueSource.number]:
                result = parseFloat(value);
                break;
            default:
                result = value;
        }
        return result;
    }

    public valueChange(value: any) {
        if (ValueSource[ValueSource.Plan] === this.param.valueSource) {
            if ('object' === typeof (value)) {
                this.planValue = value;
                this.param.value = value.id;
            } else {
                this.planValue = {id: ''};
                this.param.value = '';
            }
        } else {
            this.param.value = this.formatValue(value);
        }
        this.paramChange.emit(this.param);
    }

    public valueSourceChange(valueSource: string) {
        this.param.valueSource = valueSource;
        this.setValueSource(valueSource);
        this.valueChange('');
    }

    public insertParam(): void {
        this.insert.emit();
    }

    public deleteParam(): void {
        this.delete.emit();
    }
}
