import {AfterViewInit, Directive, ElementRef, Input, OnDestroy} from '@angular/core';

import {DomHandler} from '../domhandler';

import {PlxButtonState} from './button-state';

@Directive({selector: '[pxButton]', providers: [DomHandler]})
export class PlxButtonDirective implements AfterViewInit, OnDestroy {
  @Input() iconPos: string = 'left';

  @Input() cornerStyleClass: string = 'ui-corner-all';

  _label: string;

  _loadinglabel: string;

  _icon: string;

  _state: number;

  initialized: boolean;

  constructor(
		public el: ElementRef, public domHandler: DomHandler) {}

  ngAfterViewInit() {
	this.domHandler.addMultipleClasses(
		this.el.nativeElement, this.getStyleClass());
	if (this.icon) {
		let iconElement = document.createElement('span');
		let iconPosClass = (this.iconPos === 'right') ? 'ui-button-icon-right' :
														'ui-button-icon-left';
		iconElement.className =
			iconPosClass + ' ui-c iconfont plx-icon-' + this.icon;
		this.el.nativeElement.appendChild(iconElement);
	}

	let iconAnimationElement = document.createElement('span');
	iconAnimationElement.className =
		'ui-button-icon-left ui-c iconfont plx-icon-circle-o-notch plx-spin';
	iconAnimationElement.style.display = 'none';
	this.el.nativeElement.appendChild(iconAnimationElement);

	let labelElement = document.createElement('span');
	labelElement.className = 'ui-button-text ui-c';
	labelElement.appendChild(document.createTextNode(this.label || ''));
	this.el.nativeElement.appendChild(labelElement);

	if (this.state) {
		let spanElement =
			this.domHandler.findSingle(this.el.nativeElement, '.ui-button-text');
		if (this.state === PlxButtonState.DOING) {
		if (spanElement) {
			spanElement.innerText = this.loadinglabel || 'loading';
		}
		this.el.nativeElement.disabled = true;
		this.setIconELement(true);
		} else {
		spanElement.innerText = this.label || '';
		this.el.nativeElement.disabled = false;
		this.setIconELement(false);
		}
	}

	this.initialized = true;
  }

  getStyleClass(): string {
	let styleClass =
		'ui-button ui-widget ui-state-default ' + this.cornerStyleClass;
	if (this.icon) {
		if (this.label  !== null && this.label  !== undefined) {
		if (this.iconPos === 'left') {
			styleClass = styleClass + ' ui-button-text-icon-left';
		} else {
			styleClass = styleClass + ' ui-button-text-icon-right';
		}
		} else {
		styleClass = styleClass + ' ui-button-icon-only';
		}
	} else {
		styleClass = styleClass + ' ui-button-text-only';
	}

	return styleClass;
  }

  setIconELement(isShowAnimation: boolean) {
	let iconLeftElement = this.domHandler.findSingle(
		this.el.nativeElement, '.ui-button-icon-left.iconfont');
	if (iconLeftElement) {
		iconLeftElement.style.display = isShowAnimation ? 'none' : 'inline-block';
	}
	let iconRightElement = this.domHandler.findSingle(
		this.el.nativeElement, '.ui-button-icon-left.iconfont');
	if (iconRightElement) {
		iconRightElement.style.display =
			isShowAnimation ? 'none' : 'inline-block';
	}
	let iconAnimationElement = this.domHandler.findSingle(
		this.el.nativeElement, '.iconfont.plx-icon-circle-o-notch.plx-spin');
	if (iconAnimationElement) {
		iconAnimationElement.style.display =
			isShowAnimation ? 'inline-block' : 'none';
	}
  }

  @Input()
  get label(): string {
	return this._label;
  }

  set label(val: string) {
	this._label = val;

	if (this.initialized) {
		this.domHandler.findSingle(this.el.nativeElement, '.ui-button-text')
			.textContent = this._label;
	}
  }

  @Input()
  get loadinglabel(): string {
	return this._loadinglabel;
  }

  set loadinglabel(val: string) {
	this._loadinglabel = val;
  }

  @Input()
  get icon(): string {
	return this._icon;
  }

  set icon(val: string) {
	this._icon = val;

	if (this.initialized) {
		let iconPosClass = (this.iconPos === 'right') ? 'ui-button-icon-right' :
														'ui-button-icon-left';
		this.domHandler.findSingle(this.el.nativeElement, '.iconfont').className =
			iconPosClass + ' ui-c iconfont plx-icon-' + this.icon;
	}
  }

  @Input()
  get state(): number {
	return this._state;
  }

  set state(val: number) {
	this._state = val;
	if (this.initialized) {
		let spanElement =
			this.domHandler.findSingle(this.el.nativeElement, '.ui-button-text');
		if (this.state === PlxButtonState.DOING) {
		if (spanElement) {
			spanElement.innerText = this.loadinglabel || 'loading';
		}
		this.el.nativeElement.disabled = true;
		this.setIconELement(true);
		} else {
		spanElement.innerText = this.label || '';
		this.el.nativeElement.disabled = false;
		this.setIconELement(false);
		}
	}
  }

  ngOnDestroy() {
	while (this.el.nativeElement.hasChildNodes()) {
		this.el.nativeElement.removeChild(this.el.nativeElement.lastChild);
	}

	this.initialized = false;
  }
}
