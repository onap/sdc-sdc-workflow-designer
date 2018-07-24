/**
 * picker.component
 */

import {
    AfterViewInit,
    Component, ElementRef, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, Renderer2,
    ViewChild
} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

export interface LocaleSettings {
    firstDayOfWeek?: number;
    dayNames: string[];
    dayNamesShort: string[];
    monthNames: string[];
    monthNamesShort: string[];
    dateFns: any;
}

export enum DialogType {
    Time,
    Date,
    Month,
    Year,
}

@Component({
    selector: 'plx-daterange-picker',
    templateUrl: './pickerrange.component.html',
    styleUrls: ['./pickerrange.component.css'],
    providers: [],
})

export class PlxDateRangePickerComponent  {
    /*
disabled	boolean	false	设置为true时input框不能输入
minDate	Date	null	最小可选日期
maxDate	Date	null	最大可选日期
showTime	boolean	false	设置为true时显示时间选择器
showSeconds	boolean	false	时间选择器显示秒
timeOnly	boolean	false	设置为true时只显示时间选择器
dateFormat	string	YYYY-MM-DD HH:mm	设置时间选择模式
locale	Object	null	设置国际化对象，请参考国际化例子。
改变组件时间*/

    @Input() disabled : boolean = false;
    @Input() showTime : boolean = false;
    @Input() showSeconds : boolean = false;
    @Input() timeOnly : boolean = false;
    @Input() dateFormat	: string = "YYYY-MM-DD HH:mm";
    @Input() placeHolderStartDate	: string = "";
    @Input() placeHolderEndDate	: string = "";
    @Input() locale	: any ={
        firstDayOfWeek: 0,
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dateFns: null,
        confirm:'OK',
        to:"to"
    };
    @Input() startDate : Date;
    @Input() endDate : Date;
    @Input() canClear: boolean = true;
    @Input() startMinDate:Date;
    @Input() endMaxDate:Date;
    /**
     * @default false
     * @type {Boolean}
     * */
    @Input() supportKeyboardInput: boolean = false;
    _startSetMaxDate:Date;
    _startMaxDate:Date;
    @Input() 
    set startMaxDate( date:Date)
    {
        this._startSetMaxDate=date;
        this.BuildstartMaxDate();
    }    
    _endSetMinDate:Date;
    _endMinDate:Date;
    @Input() 
    set endMinDate( date:Date)
    {
        this._endSetMinDate=date;
        this.BuildendMinDate();
    }
    BuildstartMaxDate()
    {
        if(this._startSetMaxDate===undefined)
        {
            this._startMaxDate=this.endDate
            return;
        }
        if(this.endDate!==undefined)
        {
            this._startMaxDate= this.endDate<this._startSetMaxDate?this.endDate:this._startSetMaxDate;
            return;
        }
        this._startMaxDate=this._startSetMaxDate;
    }
    BuildendMinDate()
    {
        if(this._endSetMinDate===undefined)
        {
            this._endMinDate=this.startDate
            return;
        }
        if(this.startDate!==undefined)
        {
            this._endMinDate= this.startDate>this._endSetMinDate?this.startDate:this._endSetMinDate;
            return;
        }
        this._endMinDate=this._endSetMinDate;
    }
    
    @Output()
    onStartDateClosed: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    onEndDateClosed: EventEmitter<any> = new EventEmitter<any>();

    EvonStartDateClosed(event : any)
    {
        this.BuildendMinDate();
        if(this.startDate!==null)
        {
        event.date=new Date(this.startDate);
        }
        this.onStartDateClosed.emit(event);
        event.preventDefault();
        let dd= this;
        return;
    }


    EvonEndDateClosed (event : any)
    {

        this.BuildstartMaxDate()
        if(this.endDate!==null)
        {
        event.date=new Date(this.endDate);
        }
        this.onEndDateClosed.emit(event);
        event.preventDefault();
        let dd= this;
        return;
    }


    public navigateTo (startDate: Date, endDate: Date)
    {
        this.startDate=startDate;
        this.endDate = endDate;
    }
    


}
