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

import {
    SHOW_MODAL,
    HIDE_MODAL,
    showInfoModalAction,
    showAlertModalAction,
    showErrorModalAction,
    showCustomModalAction,
    hideModalAction
} from '../modalWrapperActions';

describe('Modal Wrapper Actions', () => {
    const actions = [
        { fn: showInfoModalAction, type: 'info', size: 'small' },
        { fn: showAlertModalAction, type: 'alert', size: 'small' },
        { fn: showErrorModalAction, type: 'error', size: 'small' },
        { fn: showCustomModalAction, type: 'custom', size: 'medium' }
    ];

    it('returns correct action', () => {
        actions.forEach(action => {
            const payload = {
                title: 'Title',
                body: 'Body',
                withButtons: true,
                actionButtonText: 'Action Button Text',
                actionButtonClick: () => {},
                closeButtonText: 'Close Button Text'
            };

            const expected = {
                type: SHOW_MODAL,
                payload: {
                    size: action.size,
                    ...payload,
                    type: action.type
                }
            };

            expect(action.fn(payload)).toEqual(expected);
        });
    });

    it('returns correct size in action', () => {
        actions.forEach(action => {
            const size = 'large';

            const payload = {
                size
            };

            const expected = {
                type: SHOW_MODAL,
                payload: { size, type: action.type }
            };

            expect(action.fn(payload)).toEqual(expected);
        });
    });

    it('returns hide modal action', () => {
        const expected = {
            type: HIDE_MODAL
        };

        expect(hideModalAction()).toEqual(expected);
    });
});
