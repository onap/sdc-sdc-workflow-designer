import {
    ApplicationRef,
    Injectable,
    Injector,
    ReflectiveInjector,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    TemplateRef
} from '@angular/core';

import {ContentRef} from '../util/popup';
import {isDefined, isString} from '../util/util';

import {PlxModalBackdrop} from './modal-backdrop';
import {PlxModalWindow} from './modal-window';
import {PlxActiveModal, PlxModalRef} from './modal-ref';

@Injectable()
export class PlxModalStack {
    private _backdropFactory: ComponentFactory<PlxModalBackdrop>;
    private _windowFactory: ComponentFactory<PlxModalWindow>;

    constructor(private _applicationRef: ApplicationRef, private _injector: Injector,
                private _componentFactoryResolver: ComponentFactoryResolver) {
        this._backdropFactory = _componentFactoryResolver.resolveComponentFactory(PlxModalBackdrop);
        this._windowFactory = _componentFactoryResolver.resolveComponentFactory(PlxModalWindow);
    }

    public open(moduleCFR: ComponentFactoryResolver, contentInjector: Injector, content: any, options): PlxModalRef {
        const containerSelector = options.container || 'body';
        const containerEl = document.querySelector(containerSelector);// 默认获取到body的DOM

        if (!containerEl) {
            throw new Error(`The specified modal container "${containerSelector}" was not found in the DOM.`);
        }

        const activeModal = new PlxActiveModal();
        const contentRef = this._getContentRef(moduleCFR, contentInjector, content, activeModal);

        let windowCmptRef: ComponentRef<PlxModalWindow>;
        let backdropCmptRef: ComponentRef<PlxModalBackdrop>;
        let ngbModalRef: PlxModalRef;


        if (options.backdrop !== false) {
            backdropCmptRef = this._backdropFactory.create(this._injector);
            this._applicationRef.attachView(backdropCmptRef.hostView);
            containerEl.appendChild(backdropCmptRef.location.nativeElement);
        }
        windowCmptRef = this._windowFactory.create(this._injector, contentRef.nodes);

        /**
         * Attaches a view so that it will be dirty checked.
         * The view will be automatically detached when it is destroyed.
         * This will throw if the view is already attached to a ViewContainer.
         */
        this._applicationRef.attachView(windowCmptRef.hostView);

        containerEl.appendChild(windowCmptRef.location.nativeElement);

        ngbModalRef = new PlxModalRef(windowCmptRef, contentRef, backdropCmptRef);

        activeModal.close = (result: any) => {
            ngbModalRef.close(result);
        };
        activeModal.dismiss = (reason: any) => {
            ngbModalRef.dismiss(reason);
        };

        this._applyWindowOptions(windowCmptRef.instance, options);

        return ngbModalRef;
    }

    private _applyWindowOptions(windowInstance: PlxModalWindow, options: Object): void {
        ['backdrop', 'keyboard', 'size', 'windowClass'].forEach((optionName: string) => {
            if (isDefined(options[optionName])) {
                windowInstance[optionName] = options[optionName];
            }
        });
    }

    private _getContentRef(moduleCFR: ComponentFactoryResolver, contentInjector: Injector, content: any,
                           context: PlxActiveModal): ContentRef {
        if (!content) {
            return new ContentRef([]);
        } else if (content instanceof TemplateRef) {
            const viewRef = content.createEmbeddedView(context);
            this._applicationRef.attachView(viewRef);
            return new ContentRef([viewRef.rootNodes], viewRef);
        } else if (isString(content)) {
            return new ContentRef([[document.createTextNode(`${content}`)]]);
        } else {
            const contentCmptFactory = moduleCFR.resolveComponentFactory(content);
            const modalContentInjector =
                ReflectiveInjector.resolveAndCreate([{provide: PlxActiveModal, useValue: context}], contentInjector);
            const componentRef = contentCmptFactory.create(modalContentInjector);
            this._applicationRef.attachView(componentRef.hostView);
            return new ContentRef([[componentRef.location.nativeElement]], componentRef.hostView, componentRef);
        }
    }
}
