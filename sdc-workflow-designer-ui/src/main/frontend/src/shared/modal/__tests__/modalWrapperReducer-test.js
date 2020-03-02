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

'use strict';

import modalWrapperReducer from 'shared/modal/modalWrapperReducer';
import {
    showInfoModalAction,
    hideModalAction
} from 'shared/modal/modalWrapperActions';

describe('Modal Wrapper Reducer', () => {
    it('returns the initial state', () => {
        const state = {
            type: 'info',
            title: 'Title'
        };
        expect(modalWrapperReducer(state, {})).toEqual(state);
    });

    it('returns correct state for show modal action', () => {
        const payload = {
            size: 'medium',
            title: 'Title'
        };

        const action = showInfoModalAction(payload);

        const expected = {
            ...payload,
            type: 'info'
        };

        expect(modalWrapperReducer({}, action)).toEqual(expected);
    });

    it('returns correct state for hide modal action', () => {
        const state = {
            size: 'medium',
            title: 'Title',
            type: 'info'
        };

        const action = hideModalAction();

        expect(modalWrapperReducer(state, action)).toEqual({});
    });
});
