import {AbstractControl, ValidationErrors} from '@angular/forms';

export function inRangeValidator(in_range: number[]): ValidationErrors|null {
    return (control: AbstractControl): ValidationErrors => {
        const value = parseFloat(control.value);
        if (isNaN(value) || value > in_range[1] || value < in_range[0]) {
            control.setErrors({
                in_range: true
            });
            return {
                in_range: true
            }
        } else {
            return null;
        }
    }
}

export function greaterOrEqualValidator(max: string): ValidationErrors|null {
    return (control: AbstractControl): ValidationErrors => {
        const value = parseFloat(control.value);
        const maxValue: any = parseFloat(max);
        if (!isNaN(maxValue) && (isNaN(value) || value < maxValue)) {
            control.setErrors({
                greater_or_equal: true
            });
            return {
                greater_or_equal: true
            }
        } else {
            return null;
        }
    }
}

export function lessOrEqualValidator(min: string): ValidationErrors|null {
    return (control: AbstractControl): ValidationErrors => {
        const value = parseFloat(control.value);
        const minValue: any = parseFloat(min);
        if (!isNaN(minValue) && (isNaN(value) || value > minValue)) {
            control.setErrors({
                less_or_equal: true
            });
            return {
                less_or_equal: true
            }
        } else {
            return null;
        }
    }
}

export function greaterThanValidator(max: string): ValidationErrors|null {
    return (control: AbstractControl): ValidationErrors => {
        const value = parseFloat(control.value);
        const maxValue: any = parseFloat(max);
        if (!isNaN(maxValue) && (isNaN(value) || value <= maxValue)) {
            control.setErrors({
                greater_than: true
            });
            return {
                greater_than: true
            }
        } else {
            return null;
        }
    }
}

export function lessThanValidator(min: string): ValidationErrors|null {
    return (control: AbstractControl): ValidationErrors => {
        const value = parseFloat(control.value);
        const minValue: any = parseFloat(min);
        if (!isNaN(minValue) && (isNaN(value) || value >= minValue)) {
            control.setErrors({
                less_than: true
            });
            return {
                less_than: true
            }
        } else {
            return null;
        }
    }
}

export function equalValidator(value: any): ValidationErrors|null {
    return (control: AbstractControl): ValidationErrors => {
        if (control.value != value) {
            control.setErrors({
                equal: true
            });
            return {
                equal: true
            }
        } else {
            return null;
        }
    }
}

export function lengthValidator(length: number): ValidationErrors|null {
    return (control: AbstractControl): ValidationErrors => {
        if (control.value && control.value.length !== length) {
            control.setErrors({
                length: true
            });
            return {
                length: true
            }
        } else {
            return null;
        }
    }
}

export function floatValidator(): ValidationErrors|null {
    return (control: AbstractControl): ValidationErrors => {
        let floatPattern = /^(-?\d+)(\.\d+)?$/;
        if (control.value && !floatPattern.test(control.value)) {
            control.setErrors({
                float: true
            });
            return {
                float: true
            }
        } else {
            return null;
        }
    }
}

export function integerValidator(): ValidationErrors|null {
    return (control: AbstractControl): ValidationErrors => {
        let integerPattern = /^-?\d+$/;
        if (control.value && !integerPattern.test(control.value)) {
            control.setErrors({
                integer: true
            });
            return {
                integer: true
            }
        } else {
            return null;
        }
    }
}