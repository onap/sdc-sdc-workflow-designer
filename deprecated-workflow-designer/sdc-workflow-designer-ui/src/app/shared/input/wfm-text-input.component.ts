import {
    Component, Input, forwardRef, SimpleChanges, ViewChild, OnChanges, Output, EventEmitter,
    ElementRef
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {
    ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator,
    AbstractControl, ValidationErrors
} from '@angular/forms';
import {
    inRangeValidator, greaterOrEqualValidator, lessOrEqualValidator,
    greaterThanValidator, lessThanValidator, equalValidator, lengthValidator, floatValidator, integerValidator
} from './validators';
import {isNullOrUndefined} from "util";

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => WfmTextInputComponent),
    multi: true
};

export const CUSTOM_INPUT_VALIDATOR: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => WfmTextInputComponent),
    multi: true
};

@Component({
    selector: 'wfm-text-input',
    template: `
        <input type="text"
            [disabled]="disabled" 
            [class]="inputClass"
            [placeholder]="placeholder"
            [required]="required"
            [maxlength]="maxlength"
            [minlength]="minlength"
            [pattern]="pattern"
            (focus)="onFocus()"
            (blur)="onBlur()"
            [(ngModel)]="value"
            [ngModelOptions]="{standalone: true}"
            #wfInput="ngModel"
        />

        <small [hidden]="!wfInput.valid || !hintLabel || !isHintLabelShow" class="hint-label">{{hintLabel}}</small>
        <small [hidden]="!wfInput.errors?.required" class="text-danger">
            {{ 'VALIDATE.REQUIRED' | translate }}
        </small>
        <small [hidden]="!wfInput.errors?.maxlength" class="text-danger">
            {{ 'VALIDATE.MAX_LENGTH' | translate: {value: maxlength} }}
        </small>
        <small [hidden]="!wfInput.errors?.minlength" class="text-danger">
            {{ 'VALIDATE.MIN_LENGTH' | translate: {value: minlength} }}
        </small>
        <small [hidden]="!wfInput.errors?.length" class="text-danger">
            {{ 'VALIDATE.LENGTH' | translate: {value: length} }}
        </small>
        <small *ngIf="patternError" [hidden]="!wfInput.errors?.pattern" class="text-danger">
            {{ patternError }}
        </small>
        <small *ngIf="!patternError && pattern === generalRules" [hidden]="!wfInput.errors?.pattern" class="text-danger">
            {{ getCommonRuleMessage(minlength + '-' + maxlength) }}
        </small>
        <small [hidden]="!wfInput.errors?.greater_or_equal" class="text-danger">
            {{ 'VALIDATE.GREATER_OR_EQUAL' | translate: {value: greater_or_equal} }}
        </small>
        <small [hidden]="!wfInput.errors?.less_or_equal" class="text-danger">
            {{ 'VALIDATE.LESS_OR_EQUAL' | translate: {value: less_or_equal} }}
        </small>
        <small [hidden]="!wfInput.errors?.greater_than" class="text-danger">
            {{ 'VALIDATE.GREATER_THAN' | translate: {value: greater_than} }}
        </small>
        <small [hidden]="!wfInput.errors?.less_than" class="text-danger">
            {{ 'VALIDATE.LESS_THAN' | translate: {value: less_than} }}
        </small>
        <small [hidden]="!wfInput.errors?.in_range" class="text-danger">
            {{ 'VALIDATE.IN_RANGE' | translate: {value: in_range} }}
        </small>
        <small [hidden]="!wfInput.errors?.equal" class="text-danger">
            {{ 'VALIDATE.EQUAL' | translate: {value: equal} }}
        </small>
        <small [hidden]="!wfInput.errors?.float" class="text-danger">
            {{ 'VALIDATE.FLOAT' | translate }}
        </small>
        <small [hidden]="!wfInput.errors?.integer" class="text-danger">
            {{ 'VALIDATE.INTEGER' | translate }}
        </small>
    `,
    styles: [`
        .hint-label {
            color:#7c868d;
        }
        input.ng-invalid {
            border-color: #d9534f;
        }
    `],
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR, CUSTOM_INPUT_VALIDATOR]
})
export class WfmTextInputComponent implements ControlValueAccessor, Validator, OnChanges {
    @Input() public disabled: boolean;
    @Input() public inputType = 'string';
    @Input() public inputClass = 'form-control';
    @Input() public placeholder = '';
    @Input() public hintLabel: string;
    @Input() public patternError: string;
    @Input() public required = false;
    @Input() public maxlength: number;
    @Input() public minlength: number;
    @Input() public pattern = '';
    @Input() public greater_or_equal: string; // >=
    @Input() public less_or_equal: string;    // <=
    @Input() public greater_than: string;     // >
    @Input() public less_than: string;        // <
    @Input() public length: number;
    @Input() public equal: any;
    @Input() public in_range: string;
    @Input() public isFocus: boolean;
    @Output() public blur: any = new EventEmitter();
    @Output() public click: any = new EventEmitter();
    @ViewChild('wfInput') public wfInput: any;

    public isHintLabelShow = false;
    private innerValue: any = '';
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;
    private _validators: any = {};
    public generalRules = '^(?![-_.])(?!\\d*$)[\\da-zA-Z-_.]*$';

    constructor(public translate: TranslateService,
                private elementRef: ElementRef) {

    }

    public ngOnChanges(changes: SimpleChanges): void {
        this._createValidator(changes);
        if (this.isFocus) {
            this.elementRef.nativeElement.querySelector('input').focus();
        }
    }

    // 动态创建Validator
    private _createValidator(changes: SimpleChanges): void {
        for (let change in changes) {
            switch (change) {
                case 'in_range':
                    if (!isNullOrUndefined(this.in_range)) {
                        this._validators.in_range = inRangeValidator(JSON.parse(this.in_range));
                    }
                    break;
                case 'greater_or_equal':
                    if (!isNullOrUndefined(this.greater_or_equal)) {
                        this._validators.greater_or_equal = greaterOrEqualValidator(this.greater_or_equal);
                    }
                    break;
                case 'less_or_equal':
                    if (!isNullOrUndefined(this.less_or_equal)) {
                        this._validators.less_or_equal = lessOrEqualValidator(this.less_or_equal);
                    }
                    break;
                case 'greater_than':
                    if (!isNullOrUndefined(this.greater_than)) {
                        this._validators.greater_than = greaterThanValidator(this.greater_than);
                    }
                    break;
                case 'less_than':
                    if (!isNullOrUndefined(this.less_than)) {
                        this._validators.less_than = lessThanValidator(this.less_than);
                    }
                    break;
                case 'equal':
                    if (!isNullOrUndefined(this.equal)) {
                        this._validators.equal = equalValidator(this.equal);
                    }
                    break;
                case 'length':
                    if (!isNullOrUndefined(this.length)) {
                        this._validators.length = lengthValidator(this.length);
                    }
                    break;
                case 'inputType':
                    delete this._validators.float;
                    delete this._validators.integer;
                    if (this.inputType === 'float') {
                        this._validators.float = floatValidator();
                    } else if (this.inputType === 'integer') {
                        this._validators.integer = integerValidator();
                    }
                    break;
            }
        }
    }

    // 执行控件验证
    public validate(c: AbstractControl): ValidationErrors | null {
        let errors: any;
        for (let validatorName in this._validators) {
            let validator = this._validators[validatorName];
            if (validator) {
                let errors = validator(c);
                if (errors) {
                    return errors;
                }
            }
        }
        return null;
    }

    public onFocus(): void {
        if (this.isFocus) {
            this.click.emit();
        }
        this.isHintLabelShow = true;
    }

    public onBlur(): void {
        this.blur.emit();
        this.isHintLabelShow = false;
        this.onTouchedCallback();
    }

    get value(): any {
        this.validate(this.wfInput.control);
        return this.innerValue;
    };

    set value(value: any) {
        if (value !== this.innerValue) {
            this.innerValue = value;
            this.onChangeCallback(value);
        }
    }

    writeValue(value: any) {
        if (value !== this.innerValue) {
            this.innerValue = value;
        }
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    public getCommonRuleMessage(length: any): string {
        let message = this.translate.get('VALIDATE.FIRST_CHARACTER')['value'] + ', ' +
            this.translate.get('VALIDATE.NOT_ALL_NUMBER')['value'] + ', ' +
            this.translate.get('VALIDATE.CHARACTER_LIMIT', {value: '[0-9],[a-z],[A-Z],[_],[-],[.]'})['value'] + ', ' +
            this.translate.get('VALIDATE.CHARACTER_LENGTH', {value: length})['value'];
        return message;
    }
}
