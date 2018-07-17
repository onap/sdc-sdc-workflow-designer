/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import { createActions, handleActions, combineActions } from 'redux-actions';

const NAMESPACE = 'inputOutput';

export const INPUTS = 'inputs';
export const OUTPUTS = 'outputs';

export const STRING = 'String';
export const BOOLEAN = 'Boolean';
export const INTEGER = 'Integer';
export const FLOAT = 'Float';

export const CHANGE_ERROR = `${NAMESPACE}/CHANGE_ERROR`;
export const SHOW_INPUTS = `${NAMESPACE}/SHOW_INPUTS`;
export const SHOW_OUTPUTS = `${NAMESPACE}/SHOW_OUTPUTS`;
export const SEARCH = `${NAMESPACE}/SEARCH`;
export const ADD = `${NAMESPACE}/ADD`;
export const CHANGE_NAME = `${NAMESPACE}/CHANGE_NAME`;
export const CHANGE_TYPE = `${NAMESPACE}/CHANGE_TYPE`;
export const CHANGE_MANDATORY = `${NAMESPACE}/CHANGE_MANDATORY`;
export const REMOVE = `${NAMESPACE}/REMOVE`;

const defaults = {
    [INPUTS]: {
        name: '',
        value: STRING,
        mandatory: false
    },
    [OUTPUTS]: {
        name: '',
        value: STRING,
        mandatory: false
    }
};

export const initialState = {
    current: INPUTS,
    [INPUTS]: [],
    [OUTPUTS]: [],
    search: '',
    types: [STRING, BOOLEAN, INTEGER, FLOAT],
    error: {
        [INPUTS]: {},
        [OUTPUTS]: {}
    }
};

export const {
    [NAMESPACE]: {
        changeError,
        showInputs,
        showOutputs,
        search,
        add,
        changeName,
        changeType,
        changeMandatory,
        remove
    }
} = createActions({
    [NAMESPACE]: {
        CHANGE_ERROR: undefined,
        SHOW_INPUTS: undefined,
        SHOW_OUTPUTS: undefined,
        SEARCH: undefined,
        ADD: undefined,
        CHANGE_NAME: (name, key) => ({ name, key }),
        CHANGE_TYPE: (type, key) => ({ type, key }),
        CHANGE_MANDATORY: (mandatory, key) => ({ mandatory, key }),
        REMOVE: undefined
    }
});

const inputOutputReducer = handleActions(
    {
        [CHANGE_ERROR]: (state, { payload }) => ({
            ...state,
            error: {
                ...state.error,
                [state.current]: payload
            }
        }),
        [SHOW_INPUTS]: state => ({ ...state, current: INPUTS }),
        [SHOW_OUTPUTS]: state => ({ ...state, current: OUTPUTS }),
        [SEARCH]: (state, { payload }) => ({ ...state, search: payload }),
        [ADD]: state => ({
            ...state,
            [state.current]: [...state[state.current], defaults[state.current]]
        }),
        [combineActions(CHANGE_NAME, CHANGE_TYPE, CHANGE_MANDATORY)](
            state,
            {
                payload: { key, ...rest }
            }
        ) {
            return {
                ...state,
                [state.current]: state[state.current].map(
                    (row, index) =>
                        key === index
                            ? {
                                  ...row,
                                  ...rest
                              }
                            : row
                )
            };
        },
        [REMOVE]: (state, { payload }) => ({
            ...state,
            [state.current]: state[state.current].filter(
                (_, index) => index !== payload
            )
        })
    },
    initialState
);

export default inputOutputReducer;
