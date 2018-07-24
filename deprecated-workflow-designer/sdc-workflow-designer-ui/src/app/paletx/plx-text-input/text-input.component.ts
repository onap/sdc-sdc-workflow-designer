import {AfterContentInit, Component, ElementRef, EventEmitter, forwardRef, HostBinding, HostListener, Input, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

import {BooleanFieldValue} from '../core/boolean-field-value';
import {NumberWrapperParseFloat} from '../core/number-wrapper-parse';
import {UUID} from '../core/uuid';

const noop = () => {};

export const PX_TEXT_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PlxTextInputComponent),
  multi: true
};

@Component({
	selector: 'plx-text-input',
	templateUrl: 'text-input.html',
	styleUrls: ['text-input.less'],
	host: {'style': 'display: inline-block;'},
	providers: [PX_TEXT_INPUT_CONTROL_VALUE_ACCESSOR]
})

export class PlxTextInputComponent implements ControlValueAccessor, OnInit,
                                             AfterContentInit {
  private _focused: boolean = false;
  private _value: any = '';
  /** Callback registered via registerOnTouched (ControlValueAccessor) */
  private _onTouchedCallback: () => void = noop;
  /** Callback registered via registerOnChange (ControlValueAccessor) */
  private _onChangeCallback: (_: any) => void = noop;

  /** Readonly properties. */
  get empty() {
    return this._value === null || this._value === '';
  }
  get inputId(): string {
    return `${this.id}`;
  }
  get isShowHintLabel() {
    return this._focused && this.hintLabel !== null;
  }
  get inputType() {
    return this.type === 'number' ? 'text' : this.type;
  }

  @Input() id: string = `plx-input-${UUID.UUID()}`;
  @Input() name: string = null;
  @Input() hintLabel: string = null;
  @Input() lang: string = 'zh';
  @Input() @BooleanFieldValue() disabled: boolean = false;

	@Input() numberShowSpinner = true;
  @Input() max: string|number = null;
  @Input() maxLength: number = 64;
  @Input() min: string|number = null;
  @Input() minLength: number = null;
  @Input() placeholder: string = '';
  @Input() @BooleanFieldValue() readOnly: boolean = false;
  @Input() @BooleanFieldValue() required: boolean = false;
  @Input() @BooleanFieldValue() notShowOption: boolean = true;
  @Input() type: string = 'text';
  @Input() tabIndex: number = null;
  @Input() pattern: string = null;

  @Input() @BooleanFieldValue() shortInput: boolean = false;
  @Input() unit: string = null;
  @Input() unitOptions: string[] = null;
  @Input() prefix: string = null;
  @Input() suffixList: string[] = null;

  // @Input() precision: number = 0;
  @Input() step: number = 1;
  @Input() width: string = '400px';
  @Input() unitWidth: string = '45px';
  @Input() unitOptionWidth: string = '84px';
  @Input() prefixWidth: string = '70px';
  @Input() historyList: string[];

	@Input() prefixOptions: string[] = [];
	@Input() prefixOptionWidth: string = '84px';

	@Input() @BooleanFieldValue() passwordSwitch: boolean = false;

  @ViewChild('input') inputViewChild: ElementRef;
  @ViewChild('inputOutter') pxTextInputElement: ElementRef;

  @HostBinding('class.input-invalid') selectClass: boolean = true;

  isDisabledUp: boolean = false;
  isDisabledDown: boolean = false;
  displayDataList: string[];
  currentPrecision: number = 0;
  keyPattern: RegExp = /[0-9\-]/;
  langPattern: RegExp =
      /[a-zA-Z]|[\u4e00-\u9fa5]|[\uff08\uff09\u300a\u300b\u2014\u2014\uff1a\uff1b\uff0c\u201c\u201d\u2018\u2019\+\=\{\}\u3001\u3002\u3010\u3011\<\>\uff01\uff1f\/\|]/g;
  timer: any;
  optionalLabel: string = null;
  hasSelection = false;
  _precision: number = 0;
  displayValue: any;

  isOpenDataList: boolean = false;
  dataListClicked: boolean = false;
  isOpenSuffixList: boolean = false;
  suffixListClicked: boolean = false;

  showUnit: string;
  isShowUnitOption: boolean = false;
  unitOptionClicked: boolean = false;

	prefixOptionClicked: boolean = false;
	isShowPrefixOption = false;
	showPrefix: string;
	showPassword: boolean = false;
	tooltipText: string;
	tooltipTexts = {
		'zh': {
			'true': '隐藏',
			'false': '显示',
		},
		'en': {
			'true': 'hidden',
			'false': 'show',
		}
	};
  isPwdSwithHover: boolean = false;
  isPwdSwithClick: boolean = false;

  _autoFocus: boolean = false;
  @Input()
  set autoFocus(value: boolean) {
    this._autoFocus = value;

    const that = this;
    if (this._autoFocus) {
      setTimeout(() => {
        that.inputViewChild.nativeElement.focus();
      }, 0);
    }
  }
  get autoFocus() {
    return this._autoFocus;
  }

  @Input()
  set precision(value: string) {
    this._precision = parseInt(value);
  }
  get precision() {
    return this._value;
  }

  get inputWidth() {
  	if (this.prefixOptions && this.prefixOptions.length > 0) {
	    if (this.unitOptions && this.unitOptions.length > 0) {
		    return `calc(${this.width} - ${this.prefixOptionWidth} - ${this.unitOptionWidth})`;
	    } else if (this.unit !== null) {
		    return `calc(${this.width} - ${this.prefixOptionWidth} - ${this.unitWidth})`;
	    } else {
		    return `calc(${this.width} - ${this.prefixOptionWidth})`;
	    }
    }

    if (this.unit !== null && this.prefix !== null) {
      return `calc(${this.width} - ${this.unitWidth} - ${this.prefixWidth})`;
    }

    if (this.unit !== null) {
      return `calc(${this.width} - ${this.unitWidth})`;
    }

    if (!!this.unitOptions && this.unitOptions.length !== 0 &&
        this.prefix !== null) {
      return `calc(${this.width} - ${this.unitOptionWidth} - ${
                                                               this.prefixWidth
                                                             })`;
    }

    if (!!this.unitOptions && this.unitOptions.length !== 0) {
      return `calc(${this.width} - ${this.unitOptionWidth})`;
    }
    if (this.prefix !== null) {
      return `calc(${this.width} - ${this.prefixWidth})`;
    }
    return this.width;
  }


  get hasUnit() {
    return this.unit !== null;
  }
  get hasUnitOption() {
    return this.showUnit !== undefined;
  }
  get hasPrefix() {
    return this.prefix !== null;
  }
	get hasPrefixOption() {
		return this.prefixOptions && this.prefixOptions.length > 0;
	}
  get isFocus() {
    return this._focused;
  }

  private _blurEmitter: EventEmitter<FocusEvent> =
      new EventEmitter<FocusEvent>();
  private _focusEmitter: EventEmitter<FocusEvent> =
      new EventEmitter<FocusEvent>();
  private click = new EventEmitter<any>();
  private unitChange = new EventEmitter<any>();
	@Output() public prefixChange = new EventEmitter<any>();

  @Output('blur')
  get onBlur(): Observable<FocusEvent> {
    return this._blurEmitter.asObservable();
  }

  @Output('focus')
  get onFocus(): Observable<FocusEvent> {
    return this._focusEmitter.asObservable();
  }

  @HostListener('focus')
  onHostFocus() {
    this.renderer.addClass(this.el.nativeElement, 'input-focus');
    this.renderer.removeClass(this.el.nativeElement, 'input-blur');
  }

  @HostListener('blur')
  onHostBlur() {
    this.renderer.addClass(this.el.nativeElement, 'input-blur');
    this.renderer.removeClass(this.el.nativeElement, 'input-focus');
  }

  @Input()
  set value(v: any) {
    v = this.filterZhChar(v);
    v = this._convertValueForInputType(v);
    if (v !== this._value) {
      this._value = v;
      if (this.type === 'number') {
        if (this._value === '') {
          this._onChangeCallback(null);
        } else if (isNaN(this._value)) {
          this._onChangeCallback(this._value);
        } else {
          this._onChangeCallback(NumberWrapperParseFloat(this._value));
        }
      } else {
        this._onChangeCallback(this._value);
      }
    }
  }
  get value(): any {
    return this._value;
  }

  constructor(
      private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (this.shortInput) {
      this.width = '120px';
      this.unitWidth = '40px';
      this.prefixWidth = '40px';
    }
    this.translateLabel();

    if (!!this.unitOptions && this.unitOptions.length !== 0) {
      this.showUnit = this.unitOptions[0];
    }

	  if (!!this.prefixOptions && this.prefixOptions.length !== 0) {
		  this.showPrefix = this.prefixOptions[0];
	  }
  }

  ngAfterContentInit() {
    if (this.pxTextInputElement) {
      Array.from(this.pxTextInputElement.nativeElement.childNodes)
          .forEach((node: HTMLElement) => {
            if (node.nodeType === 3) {
              this.pxTextInputElement.nativeElement.removeChild(node);
            }
          });
    }
  }
  private translateLabel() {
    if (this.lang === 'zh') {
      this.optionalLabel = '（可选）';
    } else {
      this.optionalLabel = '(Optional)';
    }
  }

  _handleFocus(event: FocusEvent) {
    this._focused = true;
    this._focusEmitter.emit(event);
  }

  _handleBlur(event: FocusEvent) {
    this._focused = false;
    this._onTouchedCallback();
    this._blurEmitter.emit(event);
  }

  _checkValueLimit(value: any) {
    if (this.type === 'number') {
      if ((value === '' || value === undefined || value === null) &&
          !this.required) {
        return '';
      } else if (
          this.min !== null &&
          NumberWrapperParseFloat(value) < NumberWrapperParseFloat(this.min)) {
        return this.min;
      } else if (
          this.max !== null &&
          NumberWrapperParseFloat(value) > NumberWrapperParseFloat(this.max)) {
        return this.max;
      } else {
        return value;
      }
    }
    return value;
  }

  _checkValue() {
    this.value = this._checkValueLimit(this.value);
    this.displayValue = this.value;
  }

  _handleChange(event: Event) {
    this.value = (<HTMLInputElement>event.target).value;
    this._onTouchedCallback();
  }

  openDataList() {
    this.dataListClicked = true;
    if (this.historyList) {
      if (this.value) {
        this.filterOption(this.value);
      } else {
        this.displayDataList = this.historyList;
        if (!this.isOpenDataList) {
          this.isOpenDataList = true;
        }
      }
    }
  }

  _handleClick(event: Event) {
    if (this.isShowUnitOption) {
      this.isShowUnitOption = false;
    }
    this.click.emit(event);

    if (this.historyList) {
      this.openDataList();
    }
  }

  _handleSelect(event: Event) {  // 输入框文本被选中时处理
    if (!this.hasSelection) {
      this.hasSelection = true;
    }
  }
  deleteSelection() {  // 删除选中文本，
    document.getSelection().deleteFromDocument();
    this.hasSelection = false;
  }

  _onWindowClick(event: Event) {
    if (this.historyList) {
      if (!this.dataListClicked) {
        this.isOpenDataList = false;
      }
      this.dataListClicked = false;
    }

    if (this.suffixList) {
      if (!this.suffixListClicked) {
        this.isOpenSuffixList = false;
      }
      this.suffixListClicked = false;
    }

    if (this.unitOptions) {
      if (!this.unitOptionClicked) {
        this.isShowUnitOption = false;
      }
      this.unitOptionClicked = false;
    }

	if (this.prefixOptions) {
		if (!this.prefixOptionClicked) {
			this.isShowPrefixOption = false;
		}
		this.prefixOptionClicked = false;
	}
  }

	_showPrefixOption(event: Event) {
		this.isShowPrefixOption = !this.isShowPrefixOption;
		this.prefixOptionClicked = true;
	}

  _showUnitOption(event: Event) {
    this.isShowUnitOption = !this.isShowUnitOption;
    this.unitOptionClicked = true;
  }

  _setUnit(unitValue: string) {
    this.unitOptionClicked = true;
    this.showUnit = unitValue;
    this.unitChange.emit(unitValue);
    this.isShowUnitOption = false;
  }

	_setPrefix(value: string) {
		if (value !== this.showPrefix) {
			this.showPrefix = value;
			this.prefixChange.emit(value);
		}
		this.prefixOptionClicked = true;
		this.isShowPrefixOption = false;
	}

  filterOption(value: any) {
    this.displayDataList = [];
    this.displayDataList = this.historyList.filter((data: string) => {
      return data.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });

    this.isOpenDataList = this.displayDataList.length !== 0;
  }

  concatValueAndSuffix(value: string) {
    const that = this;
    that.displayDataList = [];
    let mark = '@';
    if (value === '') {
      that.displayDataList = [];
    } else if (value.trim().toLowerCase().indexOf(mark) === -1) {
      that.displayDataList.push(value);
      that.suffixList.map((item: string) => {
        let tempValue = value + mark + item;
        that.displayDataList.push(tempValue);
      });
    } else {
      that.suffixList.map((item: string) => {
        let tempValue = value.split(mark)[0] + mark + item;
        that.displayDataList.push(tempValue);
      });
      that.displayDataList = that.displayDataList.filter((item: string) => {
        return item.trim().toLowerCase().indexOf(value) > -1;
      });
    }

    that.isOpenSuffixList = that.displayDataList.length !== 0;
  }

  _handleInput(event: any) {
    let inputValue = event.target.value.trim().toLowerCase();

    if (this.historyList) {
      this.filterOption(inputValue);
    }

    if (this.suffixList) {
      this.concatValueAndSuffix(inputValue);
    }
  }

  chooseInputData(data: any) {
    this.displayValue = data;
    this.value = data;

    this.isOpenDataList = false;
    this.dataListClicked = true;
    this.isOpenSuffixList = false;
    this.suffixListClicked = true;
  }

  writeValue(value: any) {
    this.displayValue = this._checkValueLimit(value);
    this._value = this.displayValue;
  }

  registerOnChange(fn: any) {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this._onTouchedCallback = fn;
  }

  private getConvertValue(v: any) {
    this.currentPrecision = v.toString().split('.')[1].length;
    if (this.currentPrecision === 0) {  // 输入小数点，但小数位数为0时
      return v;
    }
    if (this.currentPrecision <
        this._precision) {  // 输入小数点，且小数位数不为0
      return this.toFixed(v, this.currentPrecision);
    } else {
      return this.toFixed(v, this._precision);
    }
  }

  private filterZhChar(v: any) {
    if (this.type === 'number') {
		    let reg = /[^0-9.-]/;
		    while (reg.test(v)) {
				    v = v.replace(reg, '');
		    }
    }
    return v;
  }

  private _convertValueForInputType(v: any): any {
    switch (this.type) {
      case 'number': {
        if (v === '' || v === '-') {
          return v;
        }

        if (v.toString().indexOf('.') === -1) {  // 整数
          return this.toFixed(v, 0);
        } else {
          return this.getConvertValue(v);
        }
      }
      default:
        return v;
    }
  }

  private toFixed(value: number, precision: number) {
    return Number(value).toFixed(precision);
  }

  repeat(interval: number, dir: number) {
    let i = interval || 500;

    this.clearTimer();
    this.timer = setTimeout(() => {
      this.repeat(40, dir);
    }, i);

    this.spin(dir);
  }

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  spin(dir: number) {
    let step = this.step * dir;
    let currentValue = this._convertValueForInputType(this.value) || 0;

    this.value = Number(currentValue) + step;

    if (this.maxLength !== null &&
        this.value.toString().length > this.maxLength) {
      this.value = currentValue;
    }

    if (this.min !== null && this.value <= NumberWrapperParseFloat(this.min)) {
      this.value = this.min;
      this.isDisabledDown = true;
    }

    if (this.max !== null && this.value >= NumberWrapperParseFloat(this.max)) {
      this.value = this.max;
      this.isDisabledUp = true;
    }
    this.displayValue = this.value;
    this._onChangeCallback(NumberWrapperParseFloat(this.value));
  }

  onUpButtonMousedown(event: Event, input: HTMLInputElement) {
    if (!this.disabled && this.type === 'number') {
      input.focus();
      this.repeat(null, 1);
      event.preventDefault();
    }
  }

  onUpButtonMouseup(event: Event) {
    if (!this.disabled) {
      this.clearTimer();
    }
  }

  onUpButtonMouseleave(event: Event) {
    if (!this.disabled) {
      this.clearTimer();
    }
  }

  onDownButtonMousedown(event: Event, input: HTMLInputElement) {
    if (!this.disabled && this.type === 'number') {
      input.focus();
      this.repeat(null, -1);
      event.preventDefault();
    }
  }

  onDownButtonMouseup(event: Event) {
    if (!this.disabled) {
      this.clearTimer();
    }
  }

  onDownButtonMouseleave(event: Event) {
    if (!this.disabled) {
      this.clearTimer();
    }
  }

  onInputKeydown(event: KeyboardEvent) {
    if (this.type === 'number') {
      if (event.which === 229) {
        event.preventDefault();
        return;
      } else if (event.which === 38) {
        this.spin(1);
        event.preventDefault();
      } else if (event.which === 40) {
        this.spin(-1);
        event.preventDefault();
      }
    }
  }
  onInputKeyPress(event: KeyboardEvent) {
    let inputChar = String.fromCharCode(event.charCode);
    if (this.type === 'number') {
      if (event.which === 8) {
        return;
      }

      // if (!this.isValueLimit()) {
      //   this.handleSelection(event);
      // }

      if (inputChar === '-' && this.min !== null &&
          NumberWrapperParseFloat(this.min) >= 0) {
        event.preventDefault();
        return;
      }
      if (this.isIllegalNumberInputChar(event) ||
          this.isIllegalIntergerInput(inputChar)) {
        event.preventDefault();
        return;
      }
      if (this.isIllegalFloatInput(
              inputChar)) {  // 当该函数返回true时，执行两种情景
        this.handleSelection(event);
      }
      if (this.hasSelection) {  // 文本被选中，执行文本替换
        this.deleteSelection();
      }
    }
  }

  private handleSelection(event: any) {
    if (this.hasSelection) {  // 文本被选中，执行文本替换
      this.deleteSelection();
    } else {  // 无选中文本，阻止非法输入
      event.preventDefault();
    }
  }
  // private isValueLimit() {
  //   if (this.min !== null && NumberWrapperParseFloat(this.value) !== 0 &&
  //       this.value <= NumberWrapperParseFloat(this.min)) {
  //     return false;
  //   }
  //   if (this.max !== null && NumberWrapperParseFloat(this.value) !== 0 &&
  //       this.value >= NumberWrapperParseFloat(this.max)) {
  //     return false;
  //   }
  //   return true;
  // }

  private isIllegalNumberInputChar(event: KeyboardEvent) {
    /* 8:backspace, 46:. */
    return !this.keyPattern.test(String.fromCharCode(event.charCode)) &&
        event.which !== 46 && event.which !== 0;
  }

  private isIllegalIntergerInput(inputChar: string) {
    return this._precision === 0 &&
        (inputChar === '.' ||
         (this._value && this._value && this._value.toString().length > 0 &&
          inputChar === '-'));
  }

  private isIllegalFloatInput(inputChar: string) {
    return this._precision > 0 && this._value &&
        ((this._value.toString().length > 0 && inputChar === '-') ||
         ((this._value.toString() === '' ||
           this._value.toString().indexOf('.') > 0) &&
          inputChar === '.') ||
         (this._value.toString().indexOf('.') > 0 &&
          this._value.toString().split('.')[1].length === this._precision));
  }

  onInput(event: Event, inputValue: string) {
    this.value = inputValue;
  }

  //处理鼠标经过上下箭头时，样式设置
  isEmptyValue() {
    if (this.value === undefined || this.value === null || this.value === '') {
      return true;
    }
    return false;
  }

  isDisabledUpCaret() {
    if (this.isEmptyValue()) {
      return true;
    } else if (
        this.max !== null &&
        (NumberWrapperParseFloat(this.value) >=
         NumberWrapperParseFloat(this.max))) {
      return true;
    }
    return false;
  }

  isDisabledDownCaret() {
    if (this.isEmptyValue()) {
      return true;
    } else if (
        this.min !== null &&
        (NumberWrapperParseFloat(this.value) <=
         NumberWrapperParseFloat(this.min))) {
      return true;
    }
    return false;
  }

  _handleMouseEnterUp() {
    this.isDisabledUp = this.isDisabledUpCaret();
  }

  _handleMouseEnterDown() {
    this.isDisabledDown = this.isDisabledDownCaret();
  }

  public switch(): void {
	  this.showPassword = !this.showPassword;
	  this.showPassword?this.inputViewChild.nativeElement.type =
		  'text':this.inputViewChild.nativeElement.type = 'password';
  }

	private setPasswordTooltip(): void {
		this.tooltipTexts[this.lang][this.showPassword.toString()]
	}
}
