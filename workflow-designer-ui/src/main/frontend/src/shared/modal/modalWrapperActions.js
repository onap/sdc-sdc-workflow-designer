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

export const SHOW_MODAL = 'modal/SHOW_MODAL';
export const HIDE_MODAL = 'modal/HIDE_MODAL';

export const showInfoModalAction = createAction(SHOW_MODAL, payload => ({
    size: 'small',
    ...payload,
    type: 'info'
}));

export const showAlertModalAction = createAction(SHOW_MODAL, payload => ({
    size: 'small',
    ...payload,
    type: 'alert'
}));

export const showErrorModalAction = createAction(SHOW_MODAL, payload => ({
    size: 'small',
    ...payload,
    type: 'error'
}));

export const showCustomModalAction = createAction(SHOW_MODAL, payload => ({
    size: 'medium',
    ...payload,
    type: 'custom'
}));

export const hideModalAction = createAction(HIDE_MODAL);
