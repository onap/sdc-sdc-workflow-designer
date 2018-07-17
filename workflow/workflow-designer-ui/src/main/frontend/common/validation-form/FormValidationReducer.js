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
import { actionTypes } from './FormValidationConstants.js';
import Validator from './shared-views/Validator.js';
import forOwn from 'lodash/forOwn.js';
import { other as optionInputOther } from 'common/src/shared-views/input/validation/InputOptions.jsx';

function updateDataAndValidateReducer(state = {}, action) {
    let validationFieldsInfoCopy;
    switch (action.type) {
        case actionTypes.VALIDATE_DATA_CHANGED:
            let changed = action.deltaData;
            if (!state.validationFieldsInfo) {
                return { ...state };
            }
            validationFieldsInfoCopy = { ...state.validationFieldsInfo };
            forOwn(changed, (value, key) => {
                if (state.validationFieldsInfo[key]) {
                    let result = Validator.validate(
                        key,
                        value,
                        state.validationFieldsInfo[key].validations,
                        state,
                        action.customValidations
                    );
                    validationFieldsInfoCopy[key] = {
                        ...validationFieldsInfoCopy[key],
                        isValid: result.isValid,
                        errorText: result.errorText
                    };
                }
            });
            return {
                ...state,
                formReady: null,
                data: {
                    ...state.data,
                    ...action.deltaData
                },
                validationFieldsInfo: validationFieldsInfoCopy
            };
        case actionTypes.VALIDATE_FORM:
            if (!state.validationFieldsInfo) {
                return { ...state };
            }
            validationFieldsInfoCopy = { ...state.validationFieldsInfo };
            let formReady = true;
            forOwn(state.validationFieldsInfo, (value, key) => {
                let val = state.data && state.data[key] ? state.data[key] : '';
                let result = Validator.validate(
                    key,
                    val,
                    state.validationFieldsInfo[key].validations,
                    state,
                    {}
                );
                if (val.choice !== undefined) {
                    result = Validator.validate(
                        key,
                        val.choice,
                        state.validationFieldsInfo[key].validations,
                        state,
                        {}
                    );
                }
                if (
                    val.choice !== undefined &&
                    val.choice === optionInputOther.OTHER
                ) {
                    result = Validator.validate(
                        key,
                        val.other,
                        state.validationFieldsInfo[key].validations,
                        state,
                        {}
                    );
                }
                validationFieldsInfoCopy[key] = {
                    ...validationFieldsInfoCopy[key],
                    isValid: result.isValid,
                    errorText: result.errorText
                };
                if (!result.isValid) {
                    formReady = false;
                }
            });
            return {
                ...state,
                formReady,
                validationFieldsInfo: validationFieldsInfoCopy
            };
        case actionTypes.VALIDATE_DATA:
            let specificFields = action.data;
            if (!state.validationFieldsInfo) {
                return { ...state };
            }
            validationFieldsInfoCopy = { ...state.validationFieldsInfo };
            forOwn(specificFields, (value, key) => {
                let result = Validator.validate(
                    key,
                    value,
                    state.validationFieldsInfo[key].validations,
                    state,
                    action.customValidations
                );
                validationFieldsInfoCopy[key] = {
                    ...validationFieldsInfoCopy[key],
                    isValid: result.isValid,
                    errorText: result.errorText
                };
            });
            return {
                ...state,
                formReady: null,
                validationFieldsInfo: validationFieldsInfoCopy
            };
        default:
            return state;
    }
}

export function createFormValidationReducer(loadReducer) {
    return (state = {}, action) => {
        if (
            action.type === actionTypes.VALIDATE_DATA ||
            action.type === actionTypes.VALIDATE_FORM ||
            action.type === actionTypes.VALIDATE_DATA_CHANGED
        ) {
            return updateDataAndValidateReducer(state, action);
        } else {
            return loadReducer(state, action);
        }
    };
}
