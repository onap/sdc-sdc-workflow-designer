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

import {
    INPUTS,
    OUTPUTS,
    STRING,
    DEFAULT_STRING,
    BOOLEAN,
    INTEGER,
    FLOAT,
    SET_INPUTS_OUTPUTS,
    CHANGE_ERROR,
    SHOW_INPUTS,
    SHOW_OUTPUTS,
    SEARCH,
    ADD,
    CHANGE_NAME,
    CHANGE_TYPE,
    CHANGE_MANDATORY,
    REMOVE
} from 'features/version/inputOutput/inputOutputConstants';

export const defaultInputOutput = {
    [INPUTS]: {
        name: '',
        type: DEFAULT_STRING,
        mandatory: false
    },
    [OUTPUTS]: {
        name: '',
        type: DEFAULT_STRING,
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

const inputOutputReducer = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
        case SET_INPUTS_OUTPUTS:
            return {
                ...initialState,
                ...payload
            };

        case CHANGE_ERROR:
            return {
                ...state,
                error: {
                    ...state.error,
                    [state.current]: payload
                }
            };

        case SHOW_INPUTS:
            return { ...state, current: INPUTS };

        case SHOW_OUTPUTS:
            return { ...state, current: OUTPUTS };

        case SEARCH:
            return { ...state, search: payload };

        case ADD:
            return {
                ...state,
                [state.current]: [
                    ...state[state.current],
                    defaultInputOutput[state.current]
                ]
            };

        /* eslint-disable no-case-declarations */
        case CHANGE_NAME:
        case CHANGE_TYPE:
        case CHANGE_MANDATORY:
            const { key, ...rest } = payload;
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
        /* eslint-enable no-case-declarations */

        case REMOVE:
            return {
                ...state,
                [state.current]: state[state.current].filter(
                    (_, index) => index !== payload
                )
            };

        default:
            return state;
    }
};

export default inputOutputReducer;
