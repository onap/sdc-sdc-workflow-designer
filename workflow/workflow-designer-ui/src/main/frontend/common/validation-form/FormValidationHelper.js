/*!
 * Copyright (C) 2017 AT&T Intellectual Property. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
import { actionTypes as formActionTypes } from './FormValidationConstants.js';

class FormValidationHelper {
    static dataChanged(dispatch, { deltaData, customValidations = {} }) {
        dispatch({
            type: formActionTypes.VALIDATE_DATA_CHANGED,
            deltaData,
            customValidations
        });
    }

    static validateForm(dispatch) {
        dispatch({
            type: formActionTypes.VALIDATE_FORM
        });
    }

    static validateData(dispatch, { data }) {
        dispatch({
            type: formActionTypes.VALIDATE_DATA,
            data
        });
    }

    static checkFormValid(fields) {
        for (let field in fields) {
            if (!fields[field].isValid) {
                return false;
            }
        }
        return true;
    }

    static checkIsFieldRequired(validationFieldsInfo, fieldName) {
        let validationInfo = validationFieldsInfo[fieldName];
        if (validationInfo === undefined) {
            return false;
        }
        let index = null;
        for (index in validationInfo.validations) {
            if (validationInfo.validations[index].type === 'required') {
                return validationInfo.validations[index].data;
            }
        }
        return false;
    }

    static buildValidations({
        required,
        minValue,
        maxValue,
        maxLength,
        requiredChooseOption
    }) {
        let paramValidations = [];
        if (required !== undefined) {
            paramValidations.push({ type: 'required', data: true });
        }
        if (requiredChooseOption !== undefined) {
            paramValidations.push({ type: 'requiredChooseOption', data: true });
        }
        if (minValue !== undefined) {
            paramValidations.push({ type: 'minimum', data: minValue });
        }
        if (maxValue !== undefined) {
            paramValidations.push({ type: 'maximum', data: maxValue });
        }
        if (maxLength !== undefined) {
            paramValidations.push({ type: 'maxLength', data: maxLength });
        }
        return paramValidations;
    }

    static initValidationInfoObject(validations, additionalProps) {
        if (validations === null || validations === undefined) {
            validations = [];
        }
        return {
            isValid: true,
            errorText: '',
            validations: validations,
            ...additionalProps
        };
    }
}

export default FormValidationHelper;
