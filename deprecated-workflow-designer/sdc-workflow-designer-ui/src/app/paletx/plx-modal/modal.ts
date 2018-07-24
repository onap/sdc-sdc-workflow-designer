import {Injectable, Injector, ComponentFactoryResolver} from '@angular/core';
import {PlxModalStack} from './modal-stack';
import {PlxModalRef} from './modal-ref';

/**
 * Represent options available when opening new modal windows.
 */
export interface PlxModalOptions {
    /**
     * Whether a backdrop element should be created for a given modal (true by default).
     * Alternatively, specify 'static' for a backdrop which doesn't close the modal on click.
     */
    backdrop?: boolean | 'static';

    /**
     * An element to which to attach newly opened modal windows.
     */
    container?: string;

    /**
     * Whether to close the modal when escape key is pressed (true by default).
     */
    keyboard?: boolean;

    /**
     * Size of a new modal window.
     */
    size?: 'sm' | 'lg';

    /**
     * Custom class to append to the modal window
     */
    windowClass?: string;
}

/**
 * A service to open modal windows. Creating a modal is straightforward: create a template and pass it as an argument to
 * the "open" method!
 */
@Injectable()
export class PlxModal {
    constructor(private _moduleCFR: ComponentFactoryResolver, private _injector: Injector, private _modalStack: PlxModalStack) {
    }

    /**
     * Opens a new modal window with the specified content and using supplied options. Content can be provided
     * as a TemplateRef or a component type. If you pass a component type as content than instances of those
     * components can be injected with an instance of the PlxActiveModal class. You can use methods on the
     * PlxActiveModal class to close / dismiss modals from "inside" of a component.
     */
    public open(content: any, options: PlxModalOptions = {}): PlxModalRef {
        return this._modalStack.open(this._moduleCFR, this._injector, content, options);
    }
}
