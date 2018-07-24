import {AfterViewInit, Directive, ElementRef, forwardRef, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidatorFn, Validators} from '@angular/forms';

import {NumberWrapperParseFloat} from '../core/number-wrapper-parse';

@Directive({
  selector: '[max][ngModel],[max][formControl],[max][formControlName]',
  providers: [{
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => MaxValidatorDirective),
	multi: true
  }],
})

export class MaxValidatorDirective implements AfterViewInit {
  private _validator: ValidatorFn;
  private inputElement: any;
  constructor(elementRef: ElementRef) {
	this.inputElement = elementRef;
  }
  ngAfterViewInit() {
	this.inputElement = this.inputElement.nativeElement.querySelector('input');
	if (this.inputElement && this.inputElement.querySelector('input')) {
		this._validator = max(NumberWrapperParseFloat(
			this.inputElement.querySelector('input').getAttribute('max')));
	}
  }
  @Input()
  set max(maxValue: string) {
	this._validator = max(NumberWrapperParseFloat(maxValue));
  }

  validate(c: AbstractControl): {[key: string]: any} {
	return this._validator(c);
  }
}

function max(maxvalue: number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
	if (Validators.required(control) !== undefined &&
		Validators.required(control) !== null) {
		return null;
	}
	let v: Number = Number(control.value);
	return v > maxvalue ?
		{'max': {'requiredValue': maxvalue, 'actualValue': v}} :
		null;
  };
}
