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
    getInputOutput,
    getCurrent,
    getIsShowInputs,
    getSearch,
    getDataRows,
    getTypes,
    getError
} from 'features/version/inputOutput/inputOutputSelectors';

describe('Input/Output Selectors', () => {
    const state = {
        currentVersion: {
            general: {
                id: '1e659854c7e240c881f1dd8d5bd833cc',
                name: '1.0',
                description: 'Initial version',
                baseId: null,
                creationTime: '2018-07-19T13:09:39.066+0000',
                modificationTime: '2018-07-19T13:09:39.355+0000',
                state: 'DRAFT',
                inputs: [],
                outputs: []
            },
            inputOutput: {
                current: 'outputs',
                inputs: [
                    {
                        name: 'IP Address',
                        value: 'String',
                        mandatory: true,
                        type: 'Integer'
                    },
                    {
                        name: 'MAC Address',
                        value: 'String',
                        mandatory: false,
                        type: 'Integer'
                    },
                    {
                        name: 'IP',
                        value: 'String',
                        mandatory: true,
                        type: 'Boolean'
                    },
                    {
                        name: 'IP',
                        value: 'String',
                        mandatory: false
                    },
                    {
                        name: '',
                        value: 'String',
                        mandatory: false
                    },
                    {
                        name: '',
                        value: 'String',
                        mandatory: false
                    }
                ],
                outputs: [
                    {
                        name: 'IP Address',
                        value: 'String',
                        mandatory: true
                    },
                    {
                        name: 'IP',
                        value: 'String',
                        mandatory: true
                    },
                    {
                        name: 'IP',
                        value: 'String',
                        mandatory: false,
                        type: 'Boolean'
                    }
                ],
                search: 'IP',
                types: ['String', 'Boolean', 'Integer', 'Float'],
                error: {
                    inputs: {
                        alreadyExists: [1, 2],
                        invalidCharacters: []
                    },
                    outputs: {
                        alreadyExists: [1, 2],
                        invalidCharacters: []
                    }
                }
            }
        }
    };

    it('should `getInputOutput`', () => {
        expect(getInputOutput(state)).toEqual(state.currentVersion.inputOutput);
    });

    it('should `getCurrent`', () => {
        expect(getCurrent(state)).toEqual(
            state.currentVersion.inputOutput.current
        );
    });

    it('should `getIsShowInputs`', () => {
        expect(getIsShowInputs(state)).toBeFalsy();
    });

    it('should `getSearch`', () => {
        expect(getSearch(state)).toEqual(
            state.currentVersion.inputOutput.search
        );
    });

    it('should `getDataRows`', () => {
        expect(getDataRows(state)).toEqual(
            state.currentVersion.inputOutput.outputs
        );
    });

    it('should `getTypes`', () => {
        expect(getTypes(state)).toEqual(state.currentVersion.inputOutput.types);
    });

    it('should `getError`', () => {
        expect(getError(state)).toEqual(
            state.currentVersion.inputOutput.error[
                state.currentVersion.inputOutput.current
            ]
        );
    });
});
