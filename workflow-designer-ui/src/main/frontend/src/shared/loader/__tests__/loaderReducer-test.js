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

import loaderReducer from 'shared/loader/LoaderReducer';
import {
    initialState,
    sendRequestAction,
    recieveResponseAction
} from 'shared/loader/LoaderConstants';

describe('Loader reducer', () => {
    it('return initial state', () => {
        expect(loaderReducer(undefined, {})).toEqual(initialState);
    });

    it('send request action test', () => {
        const url = 'TEST';
        const loaderData = {
            fetchingRequests: 1,
            currentlyFetching: [url],
            isLoading: true
        };

        expect(loaderReducer(initialState, sendRequestAction(url))).toEqual(
            loaderData
        );
    });

    it('recieve response action test', () => {
        const url = 'TEST';
        const loaderData = {
            fetchingRequests: 1,
            currentlyFetching: [url],
            isLoading: true
        };

        expect(loaderReducer(loaderData, recieveResponseAction(url))).toEqual(
            initialState
        );
    });
});
