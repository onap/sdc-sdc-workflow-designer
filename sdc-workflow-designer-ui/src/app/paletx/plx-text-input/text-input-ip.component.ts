import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import {BooleanFieldValue} from '../core/boolean-field-value';

const noop = () => {};

export const PX_TEXT_INPUT_IP_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PlxTextInputIpComponent),
  multi: true
};

@Component({
	selector: 'plx-text-input-ip',
	template: `
		<div>
			<plx-text-input #textInputIp1 type="number" [(ngModel)]="ipValue1"
			 [width]="'45px'" [numberShowSpinner]="false" maxLength="3" minlength="1"
			 (keyup)="keyup($event, null, textInputIp2)" (change)="change($event)"
			  [ngClass]="{'plx-input-sm': size==='sm', 'plx-text-input-ip-invalid': errMsg}"></plx-text-input>
			<span class="plx-text-input-ip-dot">.</span>
			<plx-text-input #textInputIp2 type="number" [(ngModel)]="ipValue2"
			 [width]="'45px'" [numberShowSpinner]="false" maxLength="3" minlength="1"
			 (keyup)="keyup($event, textInputIp1, textInputIp3)" (change)="change($event)"
			  [ngClass]="{'plx-input-sm': size==='sm', 'plx-text-input-ip-invalid': errMsg}"></plx-text-input>
			<span class="plx-text-input-ip-dot">.</span>
			<plx-text-input #textInputIp3 type="number" [(ngModel)]="ipValue3"
			 [width]="'45px'" [numberShowSpinner]="false" maxLength="3" minlength="1"
			 (keyup)="keyup($event, textInputIp2, textInputIp4)" (change)="change($event)"
			  [ngClass]="{'plx-input-sm': size==='sm', 'plx-text-input-ip-invalid': errMsg}"></plx-text-input>
			<span class="plx-text-input-ip-dot">.</span>
			<plx-text-input #textInputIp4 type="number" [(ngModel)]="ipValue4"
			 [width]="'45px'" [numberShowSpinner]="false" maxLength="3" minlength="1"
			 (keyup)="keyup($event, textInputIp3, null)" (change)="change($event)"
			  [ngClass]="{'plx-input-sm': size==='sm', 'plx-text-input-ip-invalid': errMsg}"></plx-text-input>
			<div class="plx-text-input-error">{{errMsg}}</div>
		</div>
	`,
	styleUrls: ['text-input.less'],
	host: {'style': 'display: inline-block;'},
	providers: [PX_TEXT_INPUT_IP_CONTROL_VALUE_ACCESSOR]
})

export class PlxTextInputIpComponent implements OnInit, ControlValueAccessor {
	@Input() lang: string = 'zh'; //zh|en
	@Input() size: string; //空代表普通尺寸，sm代表小尺寸
	@Input() @BooleanFieldValue() required: boolean = false;
	/** Callback registered via registerOnTouched (ControlValueAccessor) */
	private _onTouchedCallback: () => void = noop;
	/** Callback registered via registerOnChange (ControlValueAccessor) */
	private _onChangeCallback: (_: any) => void = noop;
	public ipValue1: number;
	public ipValue2: number;
	public ipValue3: number;
	public ipValue4: number;
	public errMsgs = {
		'zh': {
			'empty': 'IP不能为空',
			'invalidate': '非法IP',
			'range': 'IP范围[0.0.0.0]~[255.255.255.255]'
		},
		'en': {
			'empty': 'IP can not be empty',
			'invalidate': 'Invalid IP',
			'range': 'IP range is [0.0.0.0]~[255.255.255.255]'
		}
	};
	public errMsg: string;

	constructor() {
	}

	ngOnInit(): void {
	}

  public change(event: any) :void {
      event.target.value = this.repNumber(event.target.value);
      this.setValueToOutside(this.validate());
  }

	public keyup(event: any, frontElement: any, backElement: any): void {
		event.target.value = this.repNumber(event.target.value);
		if (((event.keyCode === 13 || event.keyCode === 110 || event.keyCode === 190)
				&& event.target.value.length !== 0)
			|| event.target.value.length === 3) {       //enter:13,dot:110、190
        if (event.keyCode !== 9) {   //tab:9
            if (backElement) {
                backElement.autoFocus = true;
                backElement.inputViewChild.nativeElement.select();
            } else {
                if (event.keyCode !== 110 && event.keyCode !== 190) {
                    event.target.blur();
                }
            }
        }
		}

		if (event.target.value.length === 0  // backspace:8  delete:46
			&& (event.keyCode === 8 || event.keyCode === 46)) {
			if (frontElement) {
				frontElement.autoFocus = true;
				frontElement.inputViewChild.nativeElement.select();
			}
		}

		this.setValueToOutside(this.validate());
	}

	private setValueToOutside(validateFlg: boolean): void {
		let value;
		if (validateFlg) {
			if (this.ipValue1 && this.ipValue2 && this.ipValue3 && this.ipValue4) {
				value = this.ipValue1 + '.'
					+ this.ipValue2 + '.'+ this.ipValue3 + '.'+ this.ipValue4;
			}
		} else {
			value = false;
		}
		this._onChangeCallback(value);
	}

	writeValue(value: any): void {
		//
    this.errMsg = '';
    if (value) {
      if (this.isIPStr(value)) {
          let ipArr = value.split('.');
          this.ipValue1 = ipArr[0];
          this.ipValue2 = ipArr[1];
          this.ipValue3 = ipArr[2];
          this.ipValue4 = ipArr[3];
      } else {
          this.errMsg = this.errMsgs[this.lang]['invalidate'] + ' : ' + value;
      }
    }
	}

	registerOnChange(fn: any) {
		this._onChangeCallback = fn;
	}

	registerOnTouched(fn: any) {
		this._onTouchedCallback = fn;
	}

	public validate(): boolean {
		this.errMsg = '';
		if (this.required) {
			if (!this.ipValue1 && !this.ipValue2 && !this.ipValue3 && !this.ipValue4) {
				this.errMsg = this.errMsgs[this.lang]['empty'];
				return false;
			}
		}
		if ((this.ipValue1 || this.ipValue2 || this.ipValue3 || this.ipValue4)
			&& (!this.ipValue1 || !this.ipValue2 || !this.ipValue3 || !this.ipValue4)) {
			this.errMsg = this.errMsgs[this.lang]['invalidate'];
			return false;
		}
		if ((this.ipValue1 && (this.ipValue1 < 0 || this.ipValue1 > 255))
			|| (this.ipValue2 && (this.ipValue2 < 0 || this.ipValue2 > 255))
			|| (this.ipValue3 && (this.ipValue3 < 0 || this.ipValue3 > 255))
			|| (this.ipValue4 && (this.ipValue4 < 0 || this.ipValue4 > 255))) {
			this.errMsg = this.errMsgs[this.lang]['range'];
			return false;
		}

		return true;
	}

	private repNumber(value: any): number {
		var reg = /^[\d]+$/g;
		if (!reg.test(value)) {
			let txt = value;
			txt.replace(/[^0-9]+/, function (char, index, val) {    //匹配第一次非数字字符
				value = val.replace(/\D/g, "");    //将非数字字符替换成""
			})
		}
		return value;
	}

  private isIPStr(value: any): boolean {
    var regip4 = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    if (regip4.test(value)) {
      return true;
    }
    return false;
  }
}
