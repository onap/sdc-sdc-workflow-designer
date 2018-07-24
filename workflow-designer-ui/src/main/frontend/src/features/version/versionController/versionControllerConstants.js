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
export const SAVE_ACTION = 'versionController/SAVE';
export const CERTIFY_ACTION = 'versionController/CERTIFY';
export const SET_VERSIONS_LIST = 'versionController/SET_VERSIONS_LIST';
export const UNDO_ACTION = 'UNDO';
export const CERTIFY_JSON = {
    name: 'CERTIFIED'
};

export const saveParamsAction = createAction(SAVE_ACTION, payload => payload);
export const certifyVersionAction = createAction(
    CERTIFY_ACTION,
    payload => payload
);
