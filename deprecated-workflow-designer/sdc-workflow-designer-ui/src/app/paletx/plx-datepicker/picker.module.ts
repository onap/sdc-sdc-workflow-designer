/**
 * picker.module
 */

import { NgModule } from '@angular/core';

import { DateTimePickerComponent } from './picker.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NumberFixedLenPipe } from './numberedFixLen.pipe';
import { NgbTimepickerr } from './timepicker';
import { OesDaterangePopover, OesDaterangePopoverWindow } from './popover';
import { OesDaterangePopoverConfig } from './popover-config';
import { NgbTimepickerConfig } from './timepicker-config';
import { PlxDateRangePickerComponent } from './pickerrange.component'
export {DateTimePickerComponent} from './picker.component';

@NgModule({
    imports: [CommonModule, FormsModule],
    exports: [DateTimePickerComponent, NgbTimepickerr, OesDaterangePopover,PlxDateRangePickerComponent],
    declarations: [DateTimePickerComponent, NumberFixedLenPipe, NgbTimepickerr, OesDaterangePopoverWindow, OesDaterangePopover,PlxDateRangePickerComponent],
    providers: [OesDaterangePopoverConfig, NgbTimepickerConfig, OesDaterangePopoverConfig],
    entryComponents: [DateTimePickerComponent, OesDaterangePopoverWindow]
})
export class PlxDatePickerModule {
}

