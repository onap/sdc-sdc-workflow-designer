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
  NgZone
} from '@angular/core';

import { listenToTriggers } from './util/triggers';
import { positionElements } from './util/positioning';
import { PopupService } from './util/popup';
import { OesDaterangePopoverConfig } from './popover-config';

let nextId = 0;

@Component({
  selector: 'ngb-popover-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"popover show popover-" + placement', 'role': 'tooltip', '[id]': 'id' },
  styles: [`

    .popover-title,.popover-content{
        background-color: #fff;
    }
     .popover-custom{
        padding:9px 5px !important;
     }


   `],
  template: `
    <h3 class="popover-title">{{title}}</h3><div class="popover-content popover-custom"><ng-content></ng-content></div>
    `
})
export class OesDaterangePopoverWindow {
  @Input() public placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() public title: string;
  @Input() public id: string;
}

/**
 * A lightweight, extensible directive for fancy oes-popover creation.
 */
@Directive({ selector: '[oesDaterangePopover]', exportAs: 'oesDaterangePopover' })
export class OesDaterangePopover implements OnInit, OnDestroy {
  /**
   * Content to be displayed as oes-popover.
   */
  @Input() public oesDaterangePopover: string | TemplateRef<any>;
  /**
   * Title of a oes-popover.
   */
  @Input() public popoverTitle: string;
  /**
   * Placement of a oes-popover. Accepts: "top", "bottom", "left", "right"
   */
  @Input() public placement: 'top' | 'bottom' | 'left' | 'right';
  /**
   * Specifies events that should trigger. Supports a space separated list of event names.
   */
  @Input() public triggers: string;
  /**
   * A selector specifying the element the oes-popover should be appended to.
   * Currently only supports "body".
   */
  @Input() public container: string;
  /**
   * Emits an event when the oes-popover is shown
   */
  @Output() public shown = new EventEmitter();
  /**
   * Emits an event when the oes-popover is hidden
   */
  @Output() public hidden = new EventEmitter();

  private _OesDaterangePopoverWindowId = `ngb-popover-${nextId++}`;
  private _popupService: PopupService<OesDaterangePopoverWindow>;
  private _windowRef: ComponentRef<OesDaterangePopoverWindow>;
  private _unregisterListenersFn;
  private _zoneSubscription: any;

  constructor(
    private _elementRef: ElementRef, private _renderer: Renderer, injector: Injector,
    componentFactoryResolver: ComponentFactoryResolver, viewContainerRef: ViewContainerRef, config: OesDaterangePopoverConfig,
    ngZone: NgZone) {
    this.placement = config.placement;
    this.triggers = config.triggers;
    this.container = config.container;
    this._popupService = new PopupService<OesDaterangePopoverWindow>(
      OesDaterangePopoverWindow, injector, viewContainerRef, _renderer, componentFactoryResolver);

    this._zoneSubscription = ngZone.onStable.subscribe(() => {
      if (this._windowRef) {
        positionElements(
          this._elementRef.nativeElement, this._windowRef.location.nativeElement, this.placement,
          this.container === 'body');
      }
    });
  }

  /**
   * Opens an element’s oes-popover. This is considered a “manual” triggering of the oes-popover.
   * The context is an optional value to be injected into the oes-popover template when it is created.
   */
  public open(context?: any) {
    if (!this._windowRef) {
      this._windowRef = this._popupService.open(this.oesDaterangePopover, context);
      this._windowRef.instance.placement = this.placement;
      this._windowRef.instance.title = this.popoverTitle;
      this._windowRef.instance.id = this._OesDaterangePopoverWindowId;

      this._renderer.setElementAttribute(this._elementRef.nativeElement, 'aria-describedby', this._OesDaterangePopoverWindowId);

      if (this.container === 'body') {
        window.document.querySelector(this.container).appendChild(this._windowRef.location.nativeElement);
      }

      // we need to manually invoke change detection since events registered via
      // Renderer::listen() are not picked up by change detection with the OnPush strategy
      this._windowRef.changeDetectorRef.markForCheck();
      this.shown.emit();
    }
  }

  /**
   * Closes an element’s oes-popover. This is considered a “manual” triggering of the oes-popover.
   */
  public close(): void {
    if (this._windowRef) {
      this._renderer.setElementAttribute(this._elementRef.nativeElement, 'aria-describedby', null);
      this._popupService.close();
      this._windowRef = null;
      this.hidden.emit();
    }
  }

  /**
   * Toggles an element’s oes-popover. This is considered a “manual” triggering of the oes-popover.
   */
  public toggle(): void {
    if (this._windowRef) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Returns whether or not the oes-popover is currently being shown
   */
  public isOpen(): boolean { return this._windowRef !== null; }

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
