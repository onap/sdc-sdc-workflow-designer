import { Component, Input, Output, forwardRef, OnChanges, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { isNumber, padNumber, toInteger, isDefined } from './util/util';
import { NgbTime } from './time';
import { NgbTimepickerConfig } from './timepicker-config';

const NGB_TIMEPICKER_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgbTimepickerr),
  multi: true
};

/**
 * A lightweight & configurable timepicker directive.
 */
@Component({
  selector: 'oes-timepickerr',
  styleUrls: ['./timepicker.less'],
  template: `
     <template #popContentHour>

         <table class="hour-table">
            <tbody>
                <tr><td (click)="selectHour(hour,$event)" *ngFor="let hour of hours1 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedHour(hour), 'owl-calendar-timer-invalid': !isValidHour(hour)}">{{hour}}</td></tr>
                <tr><td (click)="selectHour(hour,$event)" *ngFor="let hour of hours2 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedHour(hour), 'owl-calendar-timer-invalid': !isValidHour(hour)}">{{hour}}</td></tr>
                <tr><td (click)="selectHour(hour,$event)" *ngFor="let hour of hours3 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedHour(hour), 'owl-calendar-timer-invalid': !isValidHour(hour)}">{{hour}}</td></tr>

            </tbody>
        </table>

     </template>

   <template #popContentMin>

         <table class="hour-table">
            <tbody>
                <tr><td (click)="selectMin(minuter,$event)" *ngFor="let minuter of minute1 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedMin(minuter), 'owl-calendar-timer-invalid': !isValidMin(minuter)}">{{minuter}}</td></tr>
                <tr><td (click)="selectMin(minuter,$event)" *ngFor="let minuter of minute2 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedMin(minuter), 'owl-calendar-timer-invalid': !isValidMin(minuter)}">{{minuter}}</td></tr>
                <tr><td (click)="selectMin(minuter,$event)" *ngFor="let minuter of minute3 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedMin(minuter), 'owl-calendar-timer-invalid': !isValidMin(minuter)}">{{minuter}}</td></tr>
                <tr><td (click)="selectMin(minuter,$event)" *ngFor="let minuter of minute4 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedMin(minuter), 'owl-calendar-timer-invalid': !isValidMin(minuter)}">{{minuter}}</td></tr>
                <tr><td (click)="selectMin(minuter,$event)" *ngFor="let minuter of minute5 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedMin(minuter), 'owl-calendar-timer-invalid': !isValidMin(minuter)}">{{minuter}}</td></tr>
                <tr><td (click)="selectMin(minuter,$event)" *ngFor="let minuter of minute6 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedMin(minuter), 'owl-calendar-timer-invalid': !isValidMin(minuter)}">{{minuter}}</td></tr>

            </tbody>
        </table>

     </template>

     <template #popContentSecond>
              <table class="hour-table">
                 <tbody>
                     <tr><td (click)="selectSecond(minuter,$event)" *ngFor="let minuter of minute1 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedSec(minuter), 'owl-calendar-timer-invalid': !isValidSec(minuter)}">{{minuter}}</td></tr>
                     <tr><td (click)="selectSecond(minuter,$event)" *ngFor="let minuter of minute2 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedSec(minuter), 'owl-calendar-timer-invalid': !isValidSec(minuter)}">{{minuter}}</td></tr>
                     <tr><td (click)="selectSecond(minuter,$event)" *ngFor="let minuter of minute3 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedSec(minuter), 'owl-calendar-timer-invalid': !isValidSec(minuter)}">{{minuter}}</td></tr>
                     <tr><td (click)="selectSecond(minuter,$event)" *ngFor="let minuter of minute4 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedSec(minuter), 'owl-calendar-timer-invalid': !isValidSec(minuter)}">{{minuter}}</td></tr>
                     <tr><td (click)="selectSecond(minuter,$event)" *ngFor="let minuter of minute5 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedSec(minuter), 'owl-calendar-timer-invalid': !isValidSec(minuter)}">{{minuter}}</td></tr>
                     <tr><td (click)="selectSecond(minuter,$event)" *ngFor="let minuter of minute6 "  [ngClass]=" {'owl-calendar-timer-selected': isSelectedSec(minuter), 'owl-calendar-timer-invalid': !isValidSec(minuter)}">{{minuter}}</td></tr>
                 </tbody>
             </table>
    </template>
      <table class="oes-time-table">
        <tr>
          <td class="i18nTimeDes">
                {{i18nTimeDes}}
          </td>
          <td class="oes-time-group">
            <input placement="top" style="padding-left:1px;padding-right:1px;border: 0; width: 30px !important;padding: 3px 0; margin: 0; font-size: 12px;"
              [oesDaterangePopover]="popContentHour"  #propHour="oesDaterangePopover" 
              #hourItem type="text" (focus)="selectItem('hour')"
              [ngClass]="{'oes-time-control-foucs-bk': currSelectedItem === 'hour'}"
              class="form-control datapicker-form-control form-control-sm oes-time-control "  maxlength="2" size="2" placeholder="HH"
              [value]="formatHour(model?.hour)" (change)="updateHour($event.target.value)"
              [readonly]="readonlyInputs" [disabled]="disabled">
               <span class="oes-time-separator">&nbsp;:&nbsp;</span>
               <input
               [oesDaterangePopover]="popContentMin"  #propMin="oesDaterangePopover"
               #minuteItem type="text"
                (focus)="selectItem('minute')"  style="padding-left:1px;padding-right:1px;border: 0; width: 30px !important;padding: 3px 0; margin: 0; font-size: 12px;"
               [ngClass]="{'oes-time-control-foucs-bk': currSelectedItem === 'minute'}"
               class="form-control datapicker-form-control form-control-sm  oes-time-control"  maxlength="2" size="2" placeholder="MM"
              [value]="formatMinSec(model?.minute)" (change)="updateMinute($event.target.value)"
              [readonly]="readonlyInputs" [disabled]="disabled">
              <span *ngIf="showSecondsTimer" class="oes-time-separator">&nbsp;:&nbsp;</span>
              <input  *ngIf="showSecondsTimer"  style="padding-left:1px;padding-right:1px;border: 0; width: 30px !important;padding: 3px 0; margin: 0; font-size: 12px;"
              [oesDaterangePopover]="popContentSecond"  #propSecond="oesDaterangePopover"
              #secondItem type="text"
               (focus)="selectItem('second')"
              [ngClass]="{'oes-time-control-foucs-bk': currSelectedItem === 'second'}"
              class="form-control datapicker-form-control form-control-sm  oes-time-control"  maxlength="2" size="2" placeholder="SS"
             [value]="formatMinSec(model?.second)" (change)="updateSecond($event.target.value)"
             [readonly]="readonlyInputs" [disabled]="disabled">
             </td>

          <td class="text-center oes-time-btns">
            <div class="oes-time-btns-wrapper">
            <button type="button" class="btn-link btn-sm oes-time-btn  oes-time-btn-shrink " (click)="changeTime(hourStep)"
              [disabled]="disabled" [class.disabled]="disabled">
              <span class="ict-shrink"></span>
            </button>
            <button type="button" class="btn-link btn-sm oes-time-btn oes-time-btn-stretch" (click)="changeTime(-hourStep)"
              [disabled]="disabled" [class.disabled]="disabled">
              <span class="ict-stretch"></span>
            </button>
           </div>
          </td>
        </tr>
      </table>
  `,
  providers: [NGB_TIMEPICKER_VALUE_ACCESSOR]
})
export class NgbTimepickerr implements ControlValueAccessor,
  OnChanges {
  public disabled: boolean;
  public model: NgbTime;
  public datemodel: Date;
  @Output() TimerChange = new EventEmitter<NgbTime>();
  /**
   * Whether to display 12H or 24H mode.
   */
  @Input() public meridian: boolean;

  /**
   * Whether to display the spinners above and below the inputs.
   */
  @Input() public spinners: boolean;

  /**
   * Whether to display seconds input.
   */
  @Input() public seconds: boolean;

  /**
   * Number of hours to increase or decrease when using a button.
   */
  @Input() public hourStep: number;

  /**
   * Number of minutes to increase or decrease when using a button.
   */
  @Input() public minuteStep: number;

  /**
   * Number of seconds to increase or decrease when using a button.
   */
  @Input() public secondStep: number;

  /**
   * To make timepicker readonly
   */
  @Input() public readonlyInputs: boolean;

  /**
   * To set the size of the inputs and button
   */
  @Input() public size: 'small' | 'medium' | 'large';

  

  private _max: Date;
  @Input()
  get max() {
      return this._max;
  }

  set max(val: Date) {
      this._max = val;
  }
  private _min: Date;
  @Input()
  get min() {
      return this._min;
  }

  set min(val: Date) {
      this._min = val;
  }

  /**
 * Whether to show the second's timer
 * @default false
 * @type {Boolean}
 * */
  @Input() showSecondsTimer: boolean;
  /**
   * datePicker的国际化描述
   */
  @Input() public i18nTimeDes: string;

  @ViewChild('hourItem') public hourItem;

  @ViewChild('minuteItem') public minuteItem;
  @ViewChild('secondItem') public secondItem;

  @ViewChild('propHour') public propHour;

  @ViewChild('propMin') public propMin;
  @ViewChild('propSecond') public propSecond;

  public currSelectedItem: 'hour' | 'minute' | 'second';

  public hours1 = ['00', '01', '02', '03', '04', '05', '06', '07'];

  public hours2 = ['08', '09', '10', '11', '12', '13', '14', '15'];

  public hours3 = ['16', '17', '18', '19', '20', '21', '22', '23'];

  public minute1 = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];

  public minute2 = ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];

  public minute3 = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'];

  public minute4 = ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39'];

  public minute5 = ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'];

  public minute6 = ['50', '51', '52', '53', '54', '55', '56', '57', '58', '59'];

  constructor(config: NgbTimepickerConfig) {
    this.meridian = config.meridian;
    this.spinners = config.spinners;
    this.seconds = config.seconds;
    this.hourStep = config.hourStep;
    this.minuteStep = config.minuteStep;
    this.secondStep = config.secondStep;
    this.disabled = config.disabled;
    this.readonlyInputs = config.readonlyInputs;
    this.size = config.size;
  }

  public onChange = (_: any) => {
    // TO DO
  }
  public onTouched = () => {
    // TO DO
  }
  public settime(date : Date)
  {
    if(date!=null&&date!==undefined)
    {
    if(this._max!==undefined&&this._max.getTime()<date.getTime())
    {
      date.setHours(this._max.getHours());
      date.setMinutes(this._max.getMinutes());
      date.setSeconds(this._max.getSeconds());
      this.TimerChange.emit(new NgbTime(date.getHours(),date.getMinutes(),date.getSeconds()));
    }
    if(this._min!==undefined&&this._min.getTime()>date.getTime())
    {
      date.setHours(this._min.getHours());
      date.setMinutes(this._min.getMinutes());
      date.setSeconds(this._min.getSeconds());
      this.TimerChange.emit(new NgbTime(date.getHours(),date.getMinutes(),date.getSeconds()));
    }
    }
    if(date!==null&&date!==undefined)
    {
      let temptime = new NgbTime(date.getHours(),date.getMinutes(),date.getSeconds())
      this.model = temptime;
      this.datemodel = date;
    }
    else
    {
      let temptime = new NgbTime(0,0,0)
      this.model = temptime;
      this.datemodel = date;
    }
   
  }
  public selectHour(hour: string, event) {
    if(!this.isValidHour(parseInt(hour)))
    {
      return;
    }
    this.model.hour = parseInt(hour);
    this.propHour.close();
    this.propagateModelChange();
    event.stopPropagation();
  }

  public selectMin(minute: string, event) {
    if(!this.isValidMin(parseInt(minute)))
    {
      return;
    }
    this.model.minute = parseInt(minute);
    this.propMin.close();
    this.propagateModelChange();

    event.stopPropagation();
  }
  public selectSecond(second: string, event) {
    if(!this.isValidSec(parseInt(second)))
    {
      return;
    }
    this.model.second = parseInt(second);
    this.propSecond.close();
    this.propagateModelChange();

    event.stopPropagation();
  }

  /**
   * ###描述
   * 单击小时或者分钟选项时触发的事件
   *
   *
   * */

  public selectItem(item: 'hour' | 'minute' | 'second') {

    // 切换选中项
    this.currSelectedItem = item;

    if (item === 'hour') {

      this.propMin?this.propMin.close():0;
      this.propSecond?this.propSecond.close():0;
    } else if (item === 'minute') {
      this.propHour?this.propHour.close():0;
      this.propSecond?this.propSecond.close():0;
    } else if (item === 'second') {
      this.propHour?this.propHour.close():0;
      this.propMin?this.propMin.close():0;
    }

    this.minuteItem.nativeElement.blur();
    this.hourItem.nativeElement.blur();

    this.secondItem?this.secondItem.nativeElement.blur():0;

    // 弹出时间选择列表
  }

  public changeTime(stepTime) {

    if (this.currSelectedItem === 'hour') { // 如果当前选中的是小时

      this.changeHour(stepTime);

    } else if (this.currSelectedItem === 'minute') {

      this.changeMinute(stepTime);
    } else if (this.currSelectedItem === 'second') {

      this.changeSecond(stepTime);
    }

  }


  public writeValue(value) {
    this.model = value ? new NgbTime(value.hour, value.minute, value.second) : new NgbTime();
    if (!this.seconds && (!value || !isNumber(value.second))) {
      this.model.second = 0;
    }
  }

  public registerOnChange(fn: (value: any) => any): void { this.onChange = fn; }

  public registerOnTouched(fn: () => any): void { this.onTouched = fn; }

  public setDisabledState(isDisabled: boolean) { this.disabled = isDisabled; }

  public changeHour(step: number) {
    let newDate = new Date(this.datemodel.getTime());
    newDate.setHours(newDate.getHours()+step);
    if(!this.isValidDate(newDate))
    {
      return;
    }
    this.model.changeHour(step);
    this.propagateModelChange();
  }

  public changeMinute(step: number) {
    let newDate = new Date(this.datemodel.getTime());
    newDate.setMinutes(newDate.getMinutes()+step);
    if(!this.isValidDate(newDate))
    {
      return;
    }
    this.model.changeMinute(step);
    this.propagateModelChange();
  }

  public changeSecond(step: number) {
    let newDate = new Date(this.datemodel.getTime());
    newDate.setSeconds(newDate.getSeconds()+step);
    if(!this.isValidDate(newDate))
    {
      return;
    }
    this.model.changeSecond(step);
    this.propagateModelChange();
  }

  public updateHour(newVal: string) {
    this.model.updateHour(toInteger(newVal));
    this.propagateModelChange();
  }

  public updateMinute(newVal: string) {
    this.model.updateMinute(toInteger(newVal));
    this.propagateModelChange();
  }

  public updateSecond(newVal: string) {
    this.model.updateSecond(toInteger(newVal));
    this.propagateModelChange();
  }

  public toggleMeridian() {
    if (this.meridian) {
      this.changeHour(12);
    }
  }

  public formatHour(value: number) {
    if (isNumber(value)) {
      if (this.meridian) {
        return padNumber(value % 12 === 0 ? 12 : value % 12);
      } else {
        return padNumber(value % 24);
      }
    } else {
      return padNumber(NaN);
    }
  }

  public formatMinSec(value: number) { return padNumber(value); }

  public setFormControlSize() { return { 'form-control-sm': this.size === 'small', 'form-control-lg': this.size === 'large' }; }

  public setButtonSize() { return { 'btn-sm': this.size === 'small', 'btn-lg': this.size === 'large' }; }


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['seconds'] && !this.seconds && this.model && !isNumber(this.model.second)) {
      this.model.second = 0;
      this.propagateModelChange(false);
    }
  }

  private propagateModelChange(touched = true) {
    this.TimerChange.emit(this.model);
    if (touched) {
      this.onTouched();
    }
    if (this.model.isValid(this.seconds)) {
      this.onChange({ hour: this.model.hour, minute: this.model.minute, second: this.model.second });
    } else {
      this.onChange(null);
    }
  }
  public closeProp()
  {
    
    if(this.propSecond!==undefined)
    {
      this.propSecond.close();
    }
    if(this.propMin!==undefined)
    {
      this.propMin.close();
    }
    if(this.propHour!==undefined)
    {
      this.propHour.close();
    }
  }
  private isValidDate(date: Date)
  {
    let isValid = true;
    if (isValid  && this._min!==undefined&&this._min!==null) {
      isValid = date.getTime()>=this._min.getTime();
    }
    if (isValid  && this._max!==undefined&&this._max!==null) {
      isValid =  date.getTime()<=this._max.getTime();
    }
    return isValid;
  }
  private isSelectedMin(strvalue:any): boolean {
    let value = parseInt(strvalue);
    if(this.model!==null&&this.model!==undefined)
    {
       return this.model.minute === value;
    }
    else
    {
      return false;
    }
}
  private isValidMin(strvalue:any): boolean {
    let value = parseInt(strvalue);
    let nowdate = new Date();
    if(this.datemodel===undefined||this.datemodel===null)
    {
    }
    else
    {
      nowdate = new Date(this.datemodel);
    }
    nowdate.setMinutes(value);
    return this.isValidDate(nowdate);
}
private isSelectedSec(strvalue:any): boolean {
  let value = parseInt(strvalue);
  if(this.model!==null&&this.model!==undefined)
  {
     return this.model.second === value;
  }
  else
  {
    return false;
  }
}
private isValidSec(strvalue:any): boolean {
  let value = parseInt(strvalue);
  let nowdate = new Date();
  if(this.datemodel===undefined||this.datemodel===null)
  {
  }
  else
  {
    nowdate = new Date(this.datemodel);
  }
  nowdate.setSeconds(value);
  return this.isValidDate(nowdate);
}
private isSelectedHour(strvalue:any): boolean {
  let value = parseInt(strvalue);
  if(this.model!==null&&this.model!==undefined)
  {
     return this.model.hour === value;
  }
  else
  {
    return false;
  }
}
private isValidHour(strvalue:any): boolean {
  debugger;
  let value = parseInt(strvalue);
  let nowdate = new Date();
  if(this.datemodel===undefined||this.datemodel===null)
  {
  }
  else
  {
    nowdate = new Date(this.datemodel);
  }
  nowdate.setHours(value);
  return this.isValidDate(nowdate);
}
}
