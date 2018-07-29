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

import { createAction } from 'redux-actions';
export const LANG = 'en';
export const USER_ID = 'USER_ID';
export const VERSION_LEVEL_LIST = [
    {
        id: '2',
        name: 'Major',
        value: '2'
    },
    {
        id: '1',
        name: 'Minor',
        value: '1'
    }
];

export const NETWORK_GENERIC_ERROR = 'NETWORK_GENERIC_ERROR';
export const genericNetworkErrorAction = createAction(
    NETWORK_GENERIC_ERROR,
    error => error
);
