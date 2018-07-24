import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanFieldValue} from '../core/boolean-field-value';

const noop = () => {};

export const PX_TEXT_INPUT_IP_ADDRESS_CONTROL_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => PlxTextInputIpAddressComponent),
	multi: true
};
@Component({
	selector: 'plx-text-input-ip-address',
	template: `
		<div>
			<plx-text-input #textInputIpAddress type="text" [(ngModel)]="ipValue"
			 [width]="'280px'" [numberShowSpinner]="false" minlength="1"
			 (keyup)="keyUp($event)" (paste)="paste($event)" class="{{sizeClass}}"></plx-text-input>
			<div class="plx-text-input-error">{{errMsg}}</div>
		</div>
	`,
	styleUrls: ['text-input.less'],
	host: {'style': 'display: inline-block;'},
	providers: [PX_TEXT_INPUT_IP_ADDRESS_CONTROL_VALUE_ACCESSOR]
})

export class PlxTextInputIpAddressComponent implements OnInit, ControlValueAccessor {
	@Input() lang: string = 'zh'; //zh|en
	@Input() size: string; //空代表普通尺寸，sm代表小尺寸
	@Input() ipAddressCheckTip: string = ''; //

	@Input() @BooleanFieldValue() required: boolean = false;

	@Input() public ipValue: string;
	@Output() public ipValueChange: EventEmitter<any> = new EventEmitter<any>();

	@Input() public ipValueFlg : boolean;
	@Output() public ipValueFlgChange: EventEmitter<any> = new EventEmitter<any>();

	private isNull : boolean = true;

	/** Callback registered via registerOnTouched (ControlValueAccessor) */
	private _onTouchedCallback: () => void = noop;
	/** Callback registered via registerOnChange (ControlValueAccessor) */
	private _onChangeCallback: (_: any) => void = noop;

	public errMsgs = {
		'zh': {
			'empty': '此项不能为空',
			'invalidate': 'IP格式不对',
			'range': '请输入正确的IPV4地址或IPV6地址',
			'range-IPV4': '请输入正确的IPV4',
			'range-IPV6': '请输入正确的IPV6'
		},
		'en': {
			'empty': 'IP can not be empty',
			'invalidate': 'IP format is incorrect',
			'range': 'IP range is  IPV4 or IPV6',
			'range-IPV4': 'IP range is  IPV4',
			'range-IPV6': 'IP range is IPV6'
		}
	};
	public errMsg: string;
	public sizeClass: string;

	constructor() {
	}

	ngOnInit(): void {
		if (this.size === 'sm') {
			this.sizeClass = 'plx-input-sm';
		}
		this.isNull = this.ipValueFlg;
		if(this.repIPStr(this.ipValue) === ''&& !this.ipValueFlg){
			this.ipValueFlg = false;
			this.emitValue();
		}
	}

	public keyUp(event: any): void {
		this.setValueToOutside(this.validate());
		this.emitValue();
	}

	public paste(event: any): void{
		setTimeout(() => {
			this.ipValue = event.target.value;
			this.setValueToOutside(this.validate());
			this.emitValue();
		}, 0);
	}

	private emitValue(){
		this.ipValueChange.emit(this.ipValue);
		this.ipValueFlgChange.emit(this.ipValueFlg);
	}

	private setValueToOutside(validateFlg: boolean): void {
		this.ipValueFlg = validateFlg;
		let value;
		if (validateFlg) {
			if (this.ipValue) {
				value = this.ipValue;
			}
			if(this.ipValue === ""  && !this.isNull){
				this.ipValueFlg = false;
			}
		} else {
			value = false;
		}
		this._onChangeCallback(value);
	}

	writeValue(value: any): void {
      //
      this.errMsg = '';
      this.ipValue = value;
      if (value) {
          this.validate();
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
			if (!this.ipValue) {
				this.errMsg = this.errMsgs[this.lang]['empty'];
				return false;
			}
		}
		if ((this.ipValue) && (!this.ipValue)) {
			this.errMsg = this.errMsgs[this.lang]['invalidate'];
			return false;
		}
		let blackStr = this.repIPStr(this.ipValue);
		if(this.ipAddressCheckTip === ''){
			if(this.ipValue !== '' && blackStr === ''){
				this.errMsg = this.errMsgs[this.lang]['range'];
				return false;
			}
		}else{
			if(this.ipValue !== '' && this.ipAddressCheckTip !== blackStr) {
				this.errMsg = this.errMsgs[this.lang]['range-'+ this.ipAddressCheckTip];
				return false;
			}
		}
		return true;
	}

	private repIPStr(value: any): string {
		let blackStr = '';
		var regip4 = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
		if (regip4.test(value)) {
			return "IPV4";
		}
		var regip6 = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
		if (regip6.test(value)) {
			return "IPV6";
		}
		return blackStr;
	}
}
