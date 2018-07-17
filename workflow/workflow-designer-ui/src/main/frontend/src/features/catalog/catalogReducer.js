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

import { createActions, handleActions } from 'redux-actions';

const NAMESPACE = 'catalog';
export const ASC = 'asc';
export const DESC = 'desc';
export const NAME = 'name';
export const LIMIT = 100;

export const FETCH = `${NAMESPACE}/FETCH`;
export const UPDATE = `${NAMESPACE}/UPDATE`;
export const SORT = `${NAMESPACE}/SORT`;
export const SCROLL = `${NAMESPACE}/SCROLL`;

export const {
    [NAMESPACE]: { fetch, update, sort, scroll }
} = createActions({
    [NAMESPACE]: {
        FETCH: undefined,
        UPDATE: undefined,
        SORT: undefined,
        SCROLL: undefined
    }
});

export const initialState = {
    workflows: {
        limit: LIMIT,
        offset: 0,
        results: [],
        total: 0
    },
    sort: {
        [NAME]: ASC
    },
    page: -1
};

const catalogReducer = handleActions(
    {
        [UPDATE]: (state, { payload }) => ({
            ...state,
            workflows: {
                ...state.workflows,
                ...payload,
                results: [...state.workflows.results, ...payload.results]
            }
        }),
        [SORT]: (state, { payload }) => ({
            ...state,
            ...initialState,
            sort: { ...state.sort, ...payload }
        }),
        [SCROLL]: state => ({ ...state, page: state.page + 1 })
    },
    initialState
);

export default catalogReducer;
