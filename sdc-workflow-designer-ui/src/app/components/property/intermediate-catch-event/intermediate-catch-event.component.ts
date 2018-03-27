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
import {Component, Input, OnChanges, SimpleChanges, OnDestroy} from "@angular/core";
import {IntermediateCatchEvent} from "../../../model/workflow/intermediate-catch-event";
import {TimerEventDefinitionType} from "../../../model/workflow/timer-event-definition";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'wfm-intermediate-catch-event',
    templateUrl: 'intermediate-catch-event.component.html',
})
export class IntermediateCatchEventComponent implements OnChanges, OnDestroy {
    @Input() public node: IntermediateCatchEvent;

    public checkedType: string;
    public timeType = TimerEventDefinitionType;
    public timeDate: string;
    public timeDuration: any = {
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0
    };

    public locale: any;
    private localeZh: any = {
        firstDayOfWeek: 0,
        dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        dateFns: null,
        confirm: '确定'
    };

    constructor(private translate: TranslateService) {
        this.locale = translate.currentLang.indexOf('zh') > -1 ? this.localeZh : undefined;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (this.node && this.node.timerEventDefinition) {
            this.checkedType = this.node.timerEventDefinition.type;
        }
        if (!this.checkedType) {
            this.checkedType = this.timeType[this.timeType.timeDuration];
        } else if (this.checkedType === this.timeType[this.timeType.timeCycle]) {
            // 兼容老数据，把timeCycle转为timeDuration
            this.checkedType = this.node.timerEventDefinition.type = this.timeType[this.timeType.timeDuration];
        }

        if (this.node.timerEventDefinition.timeDuration) {
            this.transformStringToTimeDuration();
        } else if (this.node.timerEventDefinition.timeCycle) {
            // 兼容老数据，把timeCycle转为timeDuration
            const timeCycleArray = this.node.timerEventDefinition.timeCycle.split('/');
            this.node.timerEventDefinition.timeDuration = timeCycleArray.length > 1 ? timeCycleArray[1] : timeCycleArray[0];
            this.node.timerEventDefinition.timeCycle = '';
            this.transformStringToTimeDuration();
        } else if (this.node.timerEventDefinition.timeDate) {
            this.transformISOToDate();
        }
    }

    public ngOnDestroy(): void {
        if (this.checkedType === this.timeType[this.timeType.timeDuration]) {
            this.transformTimeDurationToString();
        } else {
            this.timeDateChange();
        }
    }

    private transformStringToTimeDuration(): void {
        // R5/P1Y2M10DT2H30M
        // P1Y3M5DT6H7M30S
        this.timeDuration.year = this.splitTimeDuration('P', 'Y');
        this.timeDuration.month = this.splitTimeDuration('Y', 'M');
        this.timeDuration.day = this.splitTimeDuration('M', 'D');
        this.timeDuration.hour = this.splitTimeDuration('D', 'H');
        this.timeDuration.minute = this.splitTimeDuration('H', 'M');
        this.timeDuration.second = this.splitTimeDuration('M', 'S');
    }

    private splitTimeDuration(startKey: string, endKey: string): number {
        const timeDuration = this.node.timerEventDefinition.timeDuration;
        let start = timeDuration.indexOf(startKey);
        let end = timeDuration.indexOf(endKey);
        if (startKey === 'H' || endKey === 'S') {
            start = timeDuration.lastIndexOf(startKey);
            end = timeDuration.lastIndexOf(endKey);
        }
        const result = parseInt(timeDuration.substring(start + 1, end));
        if (isNaN(result)) {
            return 0;
        } else {
            return result;
        }
    }

    public timeTypeChange(type: string): void {
        this.checkedType = type;
        const timer = this.node.timerEventDefinition;
        timer.type = type;
        timer.timeCycle = '';
        timer.timeDate = '';
        timer.timeDuration = '';
    }

    public transformTimeDurationToString(): void {
        // R5/P1Y2M10DT2H30M
        this.node.timerEventDefinition.timeDuration = 'P'
            + this.timeDuration.year + 'Y'
            + this.timeDuration.month + 'M'
            + this.timeDuration.day + 'D'
            + 'T' + this.timeDuration.hour + 'H'
            + this.timeDuration.minute + 'M'
            + this.timeDuration.second + 'S';
    }

    private transformISOToDate(): void {
        this.timeDate = new Date(this.node.timerEventDefinition.timeDate).toString();
    }

    private pad(value: number): string {
        let result = value.toString();
        if (result.length === 1) {
            result = '0' + result;
        }
        return result;
    }

    private transformDateToISO(date: Date): string {
        return date.getFullYear() + '-' + this.pad(date.getMonth() + 1) + '-' + this.pad(date.getDate()) + 'T'
            + this.pad(date.getHours()) + ':' + this.pad(date.getMinutes()) + ':' + this.pad(date.getSeconds());
    }

    public timeDateChange(): void {
        // 2007-04-05T12:30-02:00
        if (this.timeDate) {
            const date = new Date(this.timeDate);
            this.node.timerEventDefinition.timeDate = this.transformDateToISO(date);
            console.log(this.node.timerEventDefinition.timeDate);
        }
    }
}
