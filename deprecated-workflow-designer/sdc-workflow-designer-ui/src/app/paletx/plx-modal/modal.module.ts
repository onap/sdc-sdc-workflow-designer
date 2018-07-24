import {NgModule, ModuleWithProviders} from '@angular/core';

import {PlxModalBackdrop} from './modal-backdrop';
import {PlxModalWindow} from './modal-window';
import {PlxModalStack} from './modal-stack';
import {PlxModal} from './modal';

export {PlxModal, PlxModalOptions} from './modal';
export {PlxModalRef, PlxActiveModal} from './modal-ref';
export {ModalDismissReasons} from './modal-dismiss-reasons';

@NgModule({
    declarations: [PlxModalBackdrop, PlxModalWindow],
    entryComponents: [PlxModalBackdrop, PlxModalWindow],
    providers: [PlxModal]
})
export class PlxModalModule {
    public static forRoot(): ModuleWithProviders {
        return {ngModule: PlxModalModule, providers: [PlxModal, PlxModalStack]};
    }
}
