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

'use strict';

import { NAME, ASC, DESC } from 'features/catalog/catalogConstants';
import catalogReducer, { initialState } from 'features/catalog/catalogReducer';
import { updateWorkflow, resetWorkflow } from 'features/catalog/catalogActions';

describe('Catalog Reducer', () => {
    const state = {
        hasMore: true,
        results: [
            {
                id: '755eab7752374a2380544065b59b082d',
                name: 'Workflow 1',
                description: 'description description 1'
            },
            {
                id: 'ef8159204dac4c10a85b29ec30b4bd56',
                name: 'Workflow 2',
                description: 'description description 2'
            }
        ],
        total: 0,
        sort: {
            [NAME]: ASC
        }
    };
    const sort = {
        [NAME]: DESC
    };
    const page = 0;
    const data = {
        total: 20,
        size: 100,
        page,
        sort,
        results: [
            {
                id: '755eab7752374a2380544065b59b082d',
                name: 'Workflow 11',
                description: 'description description 11'
            },
            {
                id: 'ef8159204dac4c10a85b29ec30b4bd56',
                name: 'Workflow 22',
                description: 'description description 22'
            }
        ]
    };

    it('returns the initial state', () => {
        expect(catalogReducer(undefined, {})).toEqual(initialState);
    });

    it('should replace results when page is first', () => {
        expect(catalogReducer(state, updateWorkflow({ ...data }))).toEqual({
            ...initialState,
            ...data,
            hasMore: data.results.length < data.total,
            page,
            sort
        });
    });

    it('should add results when page is not first', () => {
        expect(
            catalogReducer(state, updateWorkflow({ ...data, page: 1 })).results
        ).toEqual(expect.arrayContaining([...data.results, ...state.results]));
    });

    it('should reset state', () => {
        expect(catalogReducer({ ...state, sort }, resetWorkflow())).toEqual({
            ...initialState,
            sort
        });
    });
});
