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

export const FETCH_VERSION_LIST = 'overview/FETCH_VERSION_LIST';
export const GET_OVERVIEW = 'overview/GET_OVERVIEW';
export const SELECT_VERSION = 'overview/SELECT_VERSION';
export const UPDATE_WORKFLOW = 'overview/UPDATE_WORKFLOW';

export const versionListFetchAction = payload => ({
    type: FETCH_VERSION_LIST,
    payload
});

export const selectVersionAction = payload => ({
    type: SELECT_VERSION,
    payload
});

export const getVersionsAction = workflowId => ({
    type: GET_OVERVIEW,
    payload: workflowId
});

export const updateWorkflowAction = createAction(
    UPDATE_WORKFLOW,
    payload => payload
);
