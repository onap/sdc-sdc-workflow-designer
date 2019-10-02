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
    STRING,
    INPUTS,
    OUTPUTS
} from 'features/version/inputOutput/inputOutputConstants';
import inputOutputReducer, {
    initialState,
    defaultInputOutput
} from 'features/version/inputOutput/inputOutputReducer';
import {
    setInputsOutputs,
    changeError,
    showInputs,
    showOutputs,
    search,
    add,
    changeName,
    changeType,
    changeMandatory,
    remove
} from 'features/version/inputOutput/inputOutputActions';

describe('Input/Output Reducer', () => {
    it('should return initialState', () => {
        expect(inputOutputReducer(undefined, {})).toEqual(initialState);
    });

    it('should set inputs/outputs', () => {
        const payload = {
            inputs: [
                {
                    name: 'Input',
                    type: STRING,
                    mandatory: false
                }
            ],
            outputs: {
                name: 'Output',
                type: STRING,
                mandatory: false
            }
        };

        expect(
            inputOutputReducer(undefined, setInputsOutputs(payload))
        ).toEqual({ ...initialState, ...payload });
    });

    it('should change input/output error', () => {
        const payload = {
            alreadyExists: [1, 2],
            invalidCharacteres: [3, 4]
        };
        [INPUTS, OUTPUTS].forEach(current => {
            const state = { ...initialState, current };
            expect(inputOutputReducer(state, changeError(payload))).toEqual({
                ...state,
                error: {
                    ...state.error,
                    [current]: payload
                }
            });
        });
    });

    it('should show inputs', () => {
        expect(inputOutputReducer(undefined, showInputs())).toEqual({
            ...initialState,
            current: INPUTS
        });
    });

    it('should show outputs', () => {
        expect(inputOutputReducer(undefined, showOutputs())).toEqual({
            ...initialState,
            current: OUTPUTS
        });
    });

    it('should add input/output', () => {
        [INPUTS, OUTPUTS].forEach(current => {
            const state = { ...initialState, current };
            expect(inputOutputReducer(state, add())).toEqual({
                ...state,
                [current]: [...state[current], defaultInputOutput[current]]
            });
        });
    });

    it('should add search', () => {
        const payload = 'Search string';
        expect(inputOutputReducer(undefined, search(payload))).toEqual({
            ...initialState,
            search: payload
        });
    });

    it('should change input/output name/type/mandatory', () => {
        const name = 'New name';
        const type = 'New Type';
        const mandatory = true;
        const key = 0;
        const state = {
            ...initialState,
            [INPUTS]: [
                {
                    name: 'Old name',
                    type: 'Old type',
                    mandatory: false
                }
            ],
            [OUTPUTS]: [
                {
                    name: 'Old name',
                    type: 'Old type',
                    mandatory: false
                }
            ]
        };
        [INPUTS, OUTPUTS].forEach(current => {
            [
                {
                    action: changeName(name, key),
                    field: 'name',
                    value: name
                },
                {
                    action: changeType(type, key),
                    field: 'type',
                    value: type
                },
                {
                    action: changeMandatory(mandatory, key),
                    field: 'mandatory',
                    value: mandatory
                }
            ].forEach(actionMap => {
                const actual = inputOutputReducer(
                    { ...state, current },
                    actionMap.action
                )[current][key][actionMap.field];

                const expected = actionMap.value;

                expect(actual).toEqual(expected);
            });
        });
    });

    it('should remove input/output ', () => {
        const key = 0;
        const state = {
            ...initialState,
            [INPUTS]: [
                {
                    name: 'Name',
                    type: 'String',
                    mandatory: true
                }
            ],
            [OUTPUTS]: [
                {
                    name: 'Name',
                    type: 'String',
                    mandatory: true
                }
            ]
        };
        [INPUTS, OUTPUTS].forEach(current => {
            expect(
                inputOutputReducer({ ...state, current }, remove(key))[current]
            ).toEqual([]);
        });
    });
});
