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

import { createActions, createAction } from 'redux-actions';

import {
    NAMESPACE,
    LIMIT,
    SEARCH_CHANGED,
    FETCH_WORKFLOW
} from 'features/catalog/catalogConstants';

export const {
    [NAMESPACE]: { updateWorkflow, resetWorkflow }
} = createActions({
    [NAMESPACE]: {
        UPDATE_WORKFLOW: undefined,
        RESET_WORKFLOW: undefined
    }
});

export const fetchWorkflow = createAction(
    FETCH_WORKFLOW,
    (sort, offset, searchNameFilter) => ({
        sort,
        limit: LIMIT,
        offset,
        searchNameFilter
    })
);

export const searchChangedAction = createAction(
    SEARCH_CHANGED,
    payload => payload
);
