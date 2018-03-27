import {Directive, HostListener} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({selector: '[validateOnBlur]'})

export class PlxValidateOnBlurDirective {
  constructor(private formControl: NgControl) {}

  @HostListener('focus')
  onFocus() {
    // this.formControl.control.markAsUntouched(false);
  }

  @HostListener('blur')
  onBlur() {
    // this.formControl.control.markAsTouched(true);
  }
}
