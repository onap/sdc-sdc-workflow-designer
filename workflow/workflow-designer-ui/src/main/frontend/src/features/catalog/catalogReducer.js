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
    LIMIT,
    NAME,
    ASC,
    UPDATE,
    SORT
} from 'features/catalog/catalogConstants';

export const initialState = {
    workflows: {
        size: LIMIT,
        page: -1,
        results: [],
        total: 0
    },
    sort: {
        [NAME]: ASC
    }
};

const catalogReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case UPDATE:
            return {
                ...state,
                workflows: {
                    ...state.workflows,
                    ...payload,
                    results: [...state.workflows.results, ...payload.results]
                }
            };

        case SORT:
            return {
                ...initialState,
                sort: { ...payload.sort }
            };

        default:
            return state;
    }
};

export default catalogReducer;
