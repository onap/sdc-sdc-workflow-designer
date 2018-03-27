/**
 * Created by 10190264 on 2016/12/15.
 */
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {PlxButtonDirective} from './button.directive';

@NgModule({
  imports: [CommonModule],
  exports: [PlxButtonDirective],
  declarations: [PlxButtonDirective]
})
export class PlxButtonModule {
}