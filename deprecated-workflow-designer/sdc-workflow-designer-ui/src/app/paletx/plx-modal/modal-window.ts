import {
    Component,
    Output,
    EventEmitter,
    Input,
    ElementRef,
    Renderer,
    OnInit,
    AfterViewInit,
    OnDestroy, ViewEncapsulation
} from '@angular/core';

import {ModalDismissReasons} from './modal-dismiss-reasons';

@Component({
    selector: 'plx-modal-window',
    host: {
        '[class]': '"modal plx-modal fade show" + (windowClass ? " " + windowClass : "")',
        'role': 'dialog',
        'tabindex': '-1',
        'style': 'display: block;',
        '(keyup.esc)': 'escKey($event)',
        '(click)': 'backdropClick($event)'
    },
    template: `
        <div [class]="'modal-dialog' + (size ? ' modal-' + size : '')" role="document">
            <div class="modal-content"><ng-content></ng-content></div>
        </div>
    `,
    styleUrls: ['modal.less'],
    encapsulation: ViewEncapsulation.None
})
export class PlxModalWindow implements OnInit, AfterViewInit, OnDestroy {
    private _elWithFocus: Element;  // element that is focused prior to modal opening

    @Input() public backdrop: boolean | string = true;
    @Input() public keyboard = true;
    @Input() public size: string;
    @Input() public windowClass: string;

    @Output('dismiss') public dismissEvent = new EventEmitter();

    constructor(private _elRef: ElementRef, private _renderer: Renderer) {
    }

    public backdropClick($event): void {
        if (this.backdrop === true && this._elRef.nativeElement === $event.target) {
            this.dismiss(ModalDismissReasons.BACKDROP_CLICK);
        }
    }

    public escKey($event): void {
        if (this.keyboard && !$event.defaultPrevented) {
            this.dismiss(ModalDismissReasons.ESC);
        }
    }

    public dismiss(reason): void {
        this.dismissEvent.emit(reason);
    }

    public ngOnInit() {
        this._elWithFocus = document.activeElement;
        this._renderer.setElementClass(document.body, 'modal-open', true);
    }

    public ngAfterViewInit() {
        if (!this._elRef.nativeElement.contains(document.activeElement)) {
            this._renderer.invokeElementMethod(this._elRef.nativeElement, 'focus', []);
        }
    }

    public ngOnDestroy() {
        if (this._elWithFocus && document.body.contains(this._elWithFocus)) {
            this._renderer.invokeElementMethod(this._elWithFocus, 'focus', []);
        } else {
            this._renderer.invokeElementMethod(document.body, 'focus', []);
        }
        this._elWithFocus = null;
        this._renderer.setElementClass(document.body, 'modal-open', false);
    }
}
