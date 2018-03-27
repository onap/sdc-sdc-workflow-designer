import {AfterViewInit, Directive, ElementRef, forwardRef, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidatorFn, Validators} from '@angular/forms';

import {NumberWrapperParseFloat} from '../core/number-wrapper-parse';

@Directive({
  selector: '[min][ngModel],[min][formControl],[min][formControlName]',
  providers: [{
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => MinValidatorDirective),
	multi: true
  }],
})

export class MinValidatorDirective implements AfterViewInit {
  private _validator: ValidatorFn;
  private inputElement: any;
  constructor(elementRef: ElementRef) {
	this.inputElement = elementRef;
  }
  ngAfterViewInit() {
	this.inputElement = this.inputElement.nativeElement.querySelector('input');
	if (this.inputElement && this.inputElement.querySelector('input')) {
		this._validator = min(NumberWrapperParseFloat(
			this.inputElement.querySelector('input').getAttribute('min')));
	}
  }
  @Input()
  set min(minValue: string) {
	this._validator = min(NumberWrapperParseFloat(minValue));
  }

  validate(c: AbstractControl): {[key: string]: any} {
	return this._validator(c);
  }
}

function min(minvalue: number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
	if (Validators.required(control) !== undefined &&
		Validators.required(control) !== null) {
		return null;
	}
	let v: Number = Number(control.value);
	return v < minvalue ?
		{'min': {'requiredValue': minvalue, 'actualValue': v}} :
		null;
  };
}
