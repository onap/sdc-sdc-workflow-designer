import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { WfmTextInputComponent } from './wfm-text-input.component';

@NgModule({
    imports: [TranslateModule, CommonModule, FormsModule],
    declarations: [WfmTextInputComponent],
    exports: [WfmTextInputComponent]
})

export class WfmInputModule {

}