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

export const SET_CURRENT_VERSION = 'workflow/version/SET_CURRENT_VERSION';
export const FETCH_REQUESTED = 'workflow/version/FETCH_REQUESTED';
export const DETAILS_CHANGED = 'workflow/version/DETAILS_CHANGED';
export const FETCH_REQUESTED_FAILED = 'workflow/version/FETCH_REQUESTED_FAILED';
export const VERSION_STATE_CHANGED = 'workflow/version/VERSION_STATE_CHANGED';

export const workflowVersionFetchRequestedAction = createAction(
    FETCH_REQUESTED
);

export const workflowVersionDetailsChangedAction = createAction(
    DETAILS_CHANGED
);

export const setWorkflowVersionAction = createAction(SET_CURRENT_VERSION);
export const fetchWorkflowVersionActionFailed = createAction(
    FETCH_REQUESTED_FAILED,
    error => error
);

export const versionStateChangedAction = createAction(
    VERSION_STATE_CHANGED,
    payload => payload
);

export const versionState = {
    DRAFT: 'draft',
    CERTIFIED: 'certified'
};
