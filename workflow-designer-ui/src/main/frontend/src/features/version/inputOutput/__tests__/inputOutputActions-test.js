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
    NAME_MAX_LEN,
    STRING,
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

describe('Input/Output Actions', () => {
    it('should have `setInputsOutputs` action', () => {
        const inputs = [
            {
                name: 'Input',
                type: STRING,
                mandatory: false
            }
        ];

        const outputs = [
            {
                name: 'Output',
                type: STRING,
                mandatory: false
            }
        ];

        const expected = {
            type: SET_INPUTS_OUTPUTS,
            payload: {
                inputs,
                outputs
            }
        };

        expect(setInputsOutputs({ inputs, outputs })).toEqual(expected);
    });

    it('should have `changeError` action', () => {
        const payload = { key: 'value' };

        const expected = { type: CHANGE_ERROR, payload };

        expect(changeError(payload)).toEqual(expected);
    });

    it('should have `showInputs` action', () => {
        const expected = { type: SHOW_INPUTS };

        expect(showInputs()).toEqual(expected);
    });

    it('should have `showOutputs` action', () => {
        const expected = { type: SHOW_OUTPUTS };

        expect(showOutputs()).toEqual(expected);
    });

    it('should have `search` action', () => {
        const payload = 'Search Value';

        const expected = { type: SEARCH, payload };

        expect(search(payload)).toEqual(expected);
    });

    it('should have `add` action', () => {
        const expected = { type: ADD };

        expect(add()).toEqual(expected);
    });

    it('should have `changeName` action', () => {
        let name = 'This is a long name more that more more more and more';
        let key = 1;

        const expected = {
            type: CHANGE_NAME,
            payload: {
                name: name.substr(0, NAME_MAX_LEN),
                key
            }
        };

        expect(changeName(name, key)).toEqual(expected);
    });

    it('should have `changeType` action', () => {
        const type = 'String';
        const key = 1;

        const expected = { type: CHANGE_TYPE, payload: { type, key } };

        expect(changeType(type, key)).toEqual(expected);
    });

    it('should have `changeMandatory` action', () => {
        const mandatory = true;
        const key = 1;

        const expected = {
            type: CHANGE_MANDATORY,
            payload: { mandatory, key }
        };

        expect(changeMandatory(mandatory, key)).toEqual(expected);
    });

    it('should have `remove` action', () => {
        const payload = 1;

        const expected = { type: REMOVE, payload };

        expect(remove(payload)).toEqual(expected);
    });
});
