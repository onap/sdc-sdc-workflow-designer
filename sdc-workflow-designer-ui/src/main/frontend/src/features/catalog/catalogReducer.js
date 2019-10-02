/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http: //www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import {
    NAME,
    ASC,
    UPDATE_WORKFLOW,
    SEARCH_CHANGED
} from 'features/catalog/catalogConstants';
import { WORKFLOW_STATUS } from 'features/workflow/workflowConstants';
export const initialState = {
    paging: {
        hasMore: true,
        total: 0
    },
    sort: {
        [NAME]: ASC
    },
    status: WORKFLOW_STATUS.ACTIVE,
    //In order to save state inside iframe session
    searchNameFilter: sessionStorage.getItem('searchNameFilter') || ''
};

const catalogReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case UPDATE_WORKFLOW:
            return {
                ...state,
                ...payload,
                items:
                    payload.paging.offset === 0
                        ? [...payload.items]
                        : [...state.items, ...payload.items]
            };
        case SEARCH_CHANGED:
            return {
                ...state,
                searchNameFilter: action.payload.searchNameFilter
            };
        default:
            return state;
    }
};

export default catalogReducer;
