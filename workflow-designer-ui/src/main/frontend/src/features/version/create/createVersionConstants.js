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

export const VERSION_DETAILS_CHANGED = 'create/DETAILS_CHANGED';
export const SUBMIT_VERSION = 'create/SUBMIT_VERSION';

export const newVersionAction = createAction(
    VERSION_DETAILS_CHANGED,
    payload => payload
);

export const submitVersionAction = createAction(
    SUBMIT_VERSION,
    payload => payload
);
