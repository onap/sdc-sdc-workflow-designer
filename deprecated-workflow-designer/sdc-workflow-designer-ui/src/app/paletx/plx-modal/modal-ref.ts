import {Injectable, ComponentRef} from '@angular/core';
import {PlxModalBackdrop} from './modal-backdrop';
import {PlxModalWindow} from './modal-window';
import {ContentRef} from '../util/popup';

/**
 * A reference to an active (currently opened) modal. Instances of this class
 * can be injected into components passed as modal content.
 */
@Injectable()
export class PlxActiveModal {
    /**
     * Can be used to close a modal, passing an optional result.
     */
    public close(result?: any): void {
        // TO DO
    }

    /**
     * Can be used to dismiss a modal, passing an optional reason.
     */
    public dismiss(reason?: any): void {
        // TO DO
    }
}

/**
 * A reference to a newly opened modal.
 */
@Injectable()
export class PlxModalRef {
    private _resolve: (result?: any) => void;
    private _reject: (reason?: any) => void;

    /**
     * The instance of component used as modal's content.
     * Undefined when a TemplateRef is used as modal's content.
     */
    get componentInstance(): any {
        if (this._contentRef.componentRef) {
            return this._contentRef.componentRef.instance;
        }
    }

    // only needed to keep TS1.8 compatibility
    set componentInstance(instance: any) {
        // TO DO
    }

    /**
     * A promise that is resolved when a modal is closed and rejected when a modal is dismissed.
     */
    public result: Promise<any>;

    constructor(private _windowCmptRef: ComponentRef<PlxModalWindow>, private _contentRef: ContentRef,
                private _backdropCmptRef?: ComponentRef<PlxModalBackdrop>) {
        _windowCmptRef.instance.dismissEvent.subscribe((reason: any) => {
            this.dismiss(reason);
        });

        this.result = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        this.result.then(null, () => {
            // TO DO
        });
    }

    /**
     * Can be used to close a modal, passing an optional result.
     */
    public close(result?: any): void {
        if (this._windowCmptRef) {
            this._resolve(result);
            this._removeModalElements();
        }
    }

    /**
     * Can be used to dismiss a modal, passing an optional reason.
     */
    public dismiss(reason?: any): void {
        if (this._windowCmptRef) {
            this._reject(reason);
            this._removeModalElements();
        }
    }

    private _removeModalElements() {
        const windowNativeEl = this._windowCmptRef.location.nativeElement;
        windowNativeEl.parentNode.removeChild(windowNativeEl);
        this._windowCmptRef.destroy();

        if (this._backdropCmptRef) {
            const backdropNativeEl = this._backdropCmptRef.location.nativeElement;
            backdropNativeEl.parentNode.removeChild(backdropNativeEl);
            this._backdropCmptRef.destroy();
        }

        if (this._contentRef && this._contentRef.viewRef) {
            this._contentRef.viewRef.destroy();
        }

        this._windowCmptRef = null;
        this._backdropCmptRef = null;
        this._contentRef = null;
    }
}
