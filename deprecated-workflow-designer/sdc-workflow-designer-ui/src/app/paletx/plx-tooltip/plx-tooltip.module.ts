import {NgModule, ModuleWithProviders} from '@angular/core';

import {PlxTooltip, PlxTooltipWindow} from './plx-tooltip';
import {PlxTooltipConfig} from './plx-tooltip-config';

export {PlxTooltipConfig} from './plx-tooltip-config';
export {PlxTooltip} from './plx-tooltip';

@NgModule({declarations: [PlxTooltip, PlxTooltipWindow], exports: [PlxTooltip], entryComponents: [PlxTooltipWindow]})
export class PlxTooltipModule {
  public static forRoot(): ModuleWithProviders { return {ngModule: PlxTooltipModule, providers: [PlxTooltipConfig]}; }
}
