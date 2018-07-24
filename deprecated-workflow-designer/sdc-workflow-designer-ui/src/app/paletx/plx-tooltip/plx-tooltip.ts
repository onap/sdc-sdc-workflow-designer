import {
	Component,
	Directive,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
	OnInit,
	OnDestroy,
	Injector,
	Renderer,
	ComponentRef,
	ElementRef,
	TemplateRef,
	ViewContainerRef,
	ComponentFactoryResolver,
	NgZone, ViewEncapsulation
} from '@angular/core';
import {listenToTriggers} from '../util/triggers';
import {positionElements, getPlacement} from '../util/positioning';
import {PopupService} from '../util/popup';
import {PlxTooltipConfig} from './plx-tooltip-config';

let nextId = 0;

@Component({
	selector: 'plx-tooltip-window',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {'[class]': '"plx-tooltip show plx-tooltip-" + placement', 'role': 'tooltip', '[id]': 'id'},
	template: `
    <div class="plx-tooltip-inner"><ng-content></ng-content></div>
    `,
	styleUrls: ['./plx-tooltip.less']
})
export class PlxTooltipWindow {
	@Input() public placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
	@Input() public id: string;
}

/**
 * A lightweight, extensible directive for fancy tooltip creation.
 */
@Directive({selector: '[plxTooltip]', exportAs: 'plxTooltip'})
export class PlxTooltip implements OnInit, OnDestroy {
    /**
     * Placement of a tooltip. Accepts: "top", "bottom", "left", "right"
     */
	@Input() public placement: 'top' | 'bottom' | 'left' | 'right';
    /**
     * Specifies events that should trigger. Supports a space separated list of event names.
     */
	@Input() public triggers: string;
    /**
     * A selector specifying the element the tooltip should be appended to.
     * Currently only supports "body".
     */
	@Input() public container: string;
    /**
     * Emits an event when the tooltip is shown
     */
	@Output() public shown = new EventEmitter();
    /**
     * Emits an event when the tooltip is hidden
     */
	@Output() public hidden = new EventEmitter();

	private _plxTooltip: string | TemplateRef<any>;
	private _plxTooltipWindowId = `plx-tooltip-${nextId++}`;
	private _popupService: PopupService<PlxTooltipWindow>;
	private _windowRef: ComponentRef<PlxTooltipWindow>;
	private _unregisterListenersFn;
	private _zoneSubscription: any;

	constructor(private _elementRef: ElementRef, private _renderer: Renderer, injector: Injector,
				componentFactoryResolver: ComponentFactoryResolver, viewContainerRef: ViewContainerRef, config: PlxTooltipConfig,
				ngZone: NgZone) {
		this.placement = config.placement;
		this.triggers = config.triggers;
		this.container = config.container;
		this._popupService = new PopupService<PlxTooltipWindow>(
			PlxTooltipWindow, injector, viewContainerRef, _renderer, componentFactoryResolver);

		this._zoneSubscription = ngZone.onStable.subscribe(() => {
			if (this._windowRef) {
				positionElements(
					this._elementRef.nativeElement, this._windowRef.location.nativeElement, this.placement,
					this.container === 'body');
					let tmpPlace = getPlacement(this._elementRef.nativeElement, this._windowRef.location.nativeElement, this.placement);
					this._windowRef.instance.placement = tmpPlace;
					this._windowRef.changeDetectorRef.detectChanges();
			}
		});
	}

    /**
     * Content to be displayed as tooltip. If falsy, the tooltip won't open.
     */
	@Input()
	set plxTooltip(value: string | TemplateRef<any>) {
		this._plxTooltip = value;
		if (!value && this._windowRef) {
			this.close();
		}
	}

	get plxTooltip() {
		return this._plxTooltip;
	}

    /**
     * Opens an element’s tooltip. This is considered a “manual” triggering of the tooltip.
     * The context is an optional value to be injected into the tooltip template when it is created.
     */
	public open(context?: any) {
		if (!this._windowRef && this._plxTooltip) {
			this._windowRef = this._popupService.open(this._plxTooltip, context);
			// let tmpPlace = getPlacement(this._elementRef.nativeElement, this._windowRef.location.nativeElement, this.placement);
			this._windowRef.instance.placement = this.placement;
			this._windowRef.instance.id = this._plxTooltipWindowId;

			this._renderer.setElementAttribute(this._elementRef.nativeElement, 'aria-describedby', this._plxTooltipWindowId);

			if (this.container === 'body') {
				window.document.querySelector(this.container).appendChild(this._windowRef.location.nativeElement);
			}

            // we need to manually invoke change detection since events registered via
            // Renderer::listen() - to be determined if this is a bug in the Angular itself
			this._windowRef.changeDetectorRef.markForCheck();
			this.shown.emit();
		}
	}

    /**
     * Closes an element’s tooltip. This is considered a “manual” triggering of the tooltip.
     */
	public close(): void {
		if (this._windowRef !== null) {
			this._renderer.setElementAttribute(this._elementRef.nativeElement, 'aria-describedby', null);
			this._popupService.close();
			this._windowRef = null;
			this.hidden.emit();
		}
	}

    /**
     * Toggles an element’s tooltip. This is considered a “manual” triggering of the tooltip.
     */
	public toggle(): void {
		if (this._windowRef) {
			this.close();
		} else {
			this.open();
		}
	}

    /**
     * Returns whether or not the tooltip is currently being shown
     */
	public isOpen(): boolean {
		return !!this._windowRef;
	}

	public ngOnInit() {
		this._unregisterListenersFn = listenToTriggers(
			this._renderer, this._elementRef.nativeElement, this.triggers, this.open.bind(this), this.close.bind(this),
			this.toggle.bind(this));
	}

	public ngOnDestroy() {
		this.close();
		this._unregisterListenersFn();
		this._zoneSubscription.unsubscribe();
	}
}
