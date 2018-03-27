import {CommonModule} from '@angular/common';
import {AfterContentInit, ContentChild, ContentChildren, Directive, EmbeddedViewRef, EventEmitter, Input, NgModule} from '@angular/core';
import {OnDestroy, OnInit, Output, QueryList, TemplateRef, ViewContainerRef} from '@angular/core';
import {Component} from '@angular/core';

@Component({selector: 'plx-header', template: '<ng-content></ng-content>'})
export class PlxHeaderComponent {
}

@Component({selector: 'plx-footer', template: '<ng-content></ng-content>'})
export class PlxFooterComponent {
}

@Directive({selector: '[pTemplate]'})
export class PlxPrimeTemplateDirective {
  @Input() public type: string;

  @Input() public pxTemplate: string;

  constructor(public template: TemplateRef<any>) {}

  getType(): string {
	if (this.type) {
		console.log(
			'Defining a pTemplate with type property is deprecated use pTemplate="type" instead.');
		return this.type;
	} else {
		return this.pxTemplate;
	}
  }
}

@Directive({selector: '[pxTemplateWrapper]'})
export class PlxTemplateWrapperDirective implements OnInit, OnDestroy {
  @Input() public item: any;

  @Input() public index: number;

  @Input() public pxTemplateWrapper: TemplateRef<any>;

  view: EmbeddedViewRef<any>;

  constructor(public viewContainer: ViewContainerRef) {}

  ngOnInit() {
	this.view = this.viewContainer.createEmbeddedView(
		this.pxTemplateWrapper, {'\$implicit': this.item, 'index': this.index});
  }

  ngOnDestroy() {
	this.view.destroy();
  }
}

@Component({selector: 'plx-column', template: ``})
export class PlxColumnComponent implements AfterContentInit {
  @Input() public field: string;
  @Input() public sortField: string;
  @Input() public header: string;
  @Input() public footer: string;
  @Input() public sortable: any;
  @Input() public editable: boolean;
  @Input() public filter: boolean;
  @Input() public filterMatchMode: string;
  @Input() public rowspan: number;
  @Input() public colspan: number;
  @Input() public style: any;
  @Input() public styleClass: string;
  @Input() public hidden: boolean;
  @Input() public expander: boolean;
  @Input() public selectionMode: string;
  @Input() public filterPlaceholder: string;
  @Input() public frozen: boolean;
  @Output() sortFunction: EventEmitter<any> = new EventEmitter();
  @ContentChildren(PlxPrimeTemplateDirective) templates: QueryList<any>;
  @ContentChild(TemplateRef) template: TemplateRef<any>;

  headerTemplate: TemplateRef<any>;
  bodyTemplate: TemplateRef<any>;
  footerTemplate: TemplateRef<any>;
  filterTemplate: TemplateRef<any>;
  editorTemplate: TemplateRef<any>;

  ngAfterContentInit(): void {
	this.templates.forEach((item) => {
		switch (item.getType()) {
		case 'header':
			this.headerTemplate = item.template;
			break;

		case 'body':
			this.bodyTemplate = item.template;
			break;

		case 'footer':
			this.footerTemplate = item.template;
			break;

		case 'filter':
			this.filterTemplate = item.template;
			break;

		case 'editor':
			this.editorTemplate = item.template;
			break;

		default:
			this.bodyTemplate = item.template;
		}
	});
  }
}

@Component({selector: 'plx-row', template: ``})
export class PlxRowComponent {
  @ContentChildren(PlxColumnComponent) columns: QueryList<PlxColumnComponent>;
}

@Component({selector: 'plx-header-column-group', template: ``})
export class PlxHeaderColumnGroupComponent {
  @ContentChildren(PlxRowComponent) rows: QueryList<any>;
}

@Component({selector: 'plx-footer-column-group', template: ``})
export class PlxFooterColumnGroupComponent {
  @ContentChildren(PlxRowComponent) rows: QueryList<any>;
}

@Component({selector: 'plx-column-body-template-loader', template: ``})
export class PlxColumnBodyTemplateLoaderComponent implements OnInit, OnDestroy {
  @Input() public column: any;

  @Input() public rowData: any;

  @Input() public rowIndex: number;

  view: EmbeddedViewRef<any>;

  constructor(public viewContainer: ViewContainerRef) {}

  ngOnInit() {
	this.view =
		this.viewContainer.createEmbeddedView(this.column.bodyTemplate, {
			'\$implicit': this.column,
			'rowData': this.rowData,
			'rowIndex': this.rowIndex
		});
  }

  ngOnDestroy() {
	this.view.destroy();
  }
}

@Component({selector: 'plx-column-header-template-loader', template: ``})
export class PlxColumnHeaderTemplateLoaderComponent implements OnInit,
																OnDestroy {
  @Input() public column: any;

  view: EmbeddedViewRef<any>;

  constructor(public viewContainer: ViewContainerRef) {}

  ngOnInit() {
	this.view = this.viewContainer.createEmbeddedView(
		this.column.headerTemplate, {'\$implicit': this.column});
  }

  ngOnDestroy() {
	this.view.destroy();
  }
}

@Component({selector: 'plx-column--footer-template-loader', template: ``})
export class PlxColumnFooterTemplateLoaderComponent implements OnInit,
																OnDestroy {
  @Input() public column: any;

  view: EmbeddedViewRef<any>;

  constructor(public viewContainer: ViewContainerRef) {}

  ngOnInit() {
	this.view = this.viewContainer.createEmbeddedView(
		this.column.footerTemplate, {'\$implicit': this.column});
  }

  ngOnDestroy() {
	this.view.destroy();
  }
}

@Component({selector: 'plx-column-filter-template-loader', template: ``})
export class PlxColumnFilterTemplateLoaderComponent implements OnInit,
																OnDestroy {
  @Input() public column: any;

  view: EmbeddedViewRef<any>;

  constructor(public viewContainer: ViewContainerRef) {}

  ngOnInit() {
	this.view = this.viewContainer.createEmbeddedView(
		this.column.filterTemplate, {'\$implicit': this.column});
  }

  ngOnDestroy() {
	this.view.destroy();
  }
}

@Component({selector: 'plx-column-editor-template-loader', template: ``})
export class PlxColumnEditorTemplateLoaderComponent implements OnInit,
																OnDestroy {
  @Input() public column: any;

  @Input() public rowData: any;

  @Input() public rowIndex: any;

  view: EmbeddedViewRef<any>;

  constructor(public viewContainer: ViewContainerRef) {}

  ngOnInit() {
	this.view =
		this.viewContainer.createEmbeddedView(this.column.editorTemplate, {
			'\$implicit': this.column,
			'rowData': this.rowData,
			'rowIndex': this.rowIndex
		});
  }

  ngOnDestroy() {
	this.view.destroy();
  }
}

@Component({selector: 'plx-template-loader', template: ``})
export class PlxTemplateLoaderComponent implements OnInit, OnDestroy {
  @Input() public template: TemplateRef<any>;

  @Input() public data: any;

  view: EmbeddedViewRef<any>;

  constructor(public viewContainer: ViewContainerRef) {}

  ngOnInit() {
	if (this.template) {
		this.view = this.viewContainer.createEmbeddedView(
			this.template, {'\$implicit': this.data});
	}
  }

  ngOnDestroy() {
	if (this.view) {
		this.view.destroy();
	}
  }
}

@NgModule({
  imports: [CommonModule],
  exports: [
	PlxHeaderComponent, PlxFooterComponent, PlxColumnComponent,
	PlxTemplateWrapperDirective, PlxColumnHeaderTemplateLoaderComponent,
	PlxColumnBodyTemplateLoaderComponent, PlxColumnFooterTemplateLoaderComponent,
	PlxColumnFilterTemplateLoaderComponent, PlxPrimeTemplateDirective,
	PlxTemplateLoaderComponent, PlxRowComponent, PlxHeaderColumnGroupComponent,
	PlxFooterColumnGroupComponent, PlxColumnEditorTemplateLoaderComponent
  ],
  declarations: [
	PlxHeaderComponent, PlxFooterComponent, PlxColumnComponent,
	PlxTemplateWrapperDirective, PlxColumnHeaderTemplateLoaderComponent,
	PlxColumnBodyTemplateLoaderComponent, PlxColumnFooterTemplateLoaderComponent,
	PlxColumnFilterTemplateLoaderComponent, PlxPrimeTemplateDirective,
	PlxTemplateLoaderComponent, PlxRowComponent, PlxHeaderColumnGroupComponent,
	PlxFooterColumnGroupComponent, PlxColumnEditorTemplateLoaderComponent
  ]
})
export class PlxSharedModule {
}