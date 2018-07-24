import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {PlxTooltipModule} from '../plx-tooltip/plx-tooltip.module';
import {Ipv4ValidatorDirective} from './ipv4-validator.directive';
import {Ipv6ValidatorDirective} from './ipv6-validator.directive';
import {MaxValidatorDirective} from './max-validator.directive';
import {MinValidatorDirective} from './min-validator.directive';
import {PlxTextInputComponent} from './text-input.component';
import {PlxValidateOnBlurDirective} from './validate-on-blur.directive';
import {PlxTextInputIpComponent} from './text-input-ip.component';
import {PlxTextInputIpAddressComponent} from './text-input-ip-address.component';


@NgModule({
  imports: [CommonModule, FormsModule, PlxTooltipModule],
  declarations: [
    PlxTextInputComponent, Ipv4ValidatorDirective, Ipv6ValidatorDirective,
	  MaxValidatorDirective, MinValidatorDirective, PlxValidateOnBlurDirective,
	  PlxTextInputIpComponent, PlxTextInputIpAddressComponent
  ],
  exports: [
    PlxTextInputComponent, Ipv4ValidatorDirective, Ipv6ValidatorDirective,
	  MaxValidatorDirective, MinValidatorDirective, PlxValidateOnBlurDirective,
	  PlxTextInputIpComponent, PlxTextInputIpAddressComponent
  ]
})

export class PlxTextInputModule {
}
