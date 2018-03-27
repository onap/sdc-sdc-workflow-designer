import {Directive, forwardRef} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validators} from '@angular/forms';

@Directive({
  selector: '[ipv4][ngModel],[ipv4][formControl],[ipv4][formControlName]',
  providers: [{
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => Ipv4ValidatorDirective),
	multi: true
  }],
})

export class Ipv4ValidatorDirective {
  validate(c: AbstractControl) {
	if (Validators.required(c) !== undefined &&
		Validators.required(c) !== null) {
		return null;
	}
	const ipv4Reg =
		/^((25[0-5]|2[0-4]\d|[0-1]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[0-1]?\d\d?)$/;
	let regex = new RegExp(ipv4Reg);
	return regex.test(c.value) ? null : {'ipv4': true};
  }
}
