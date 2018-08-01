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
        paging: {
            offset: 1,
            limit: 1,
            count: 1,
            hasMore: false,
            total: 2
        },
        sort: {
            [NAME]: ASC
        },
        items: [
            {
                id: 'c5b7ca1a0f7944bfa948b85b32c5f314',
                name: 'Workflow_2',
                description: null,
                versionStates: ['DRAFT'],
                versions: null
            },
            {
                id: '221336ef3f1645c686bc81899368ac27',
                name: 'Workflow_1',
                description: null,
                versionStates: ['DRAFT'],
                versions: null
            }
        ]
    };

    const sort = {
        [NAME]: DESC
    };

    const offset = 0;

    const dataPayload = {
        paging: {
            offset,
            limit: 10,
            count: 2,
            hasMore: false,
            total: 2
        },
        items: [
            {
                id: 'c5b7ca1a0f7944bfa948b85b32c5f314',
                name: 'Workflow_2',
                description: null,
                versionStates: ['DRAFT'],
                versions: null
            },
            {
                id: '221336ef3f1645c686bc81899368ac27',
                name: 'Workflow_1',
                description: null,
                versionStates: ['DRAFT'],
                versions: null
            }
        ]
    };

    it('returns the initial state', () => {
        expect(catalogReducer(undefined, {})).toEqual(initialState);
    });

    it('should replace results when page is first', () => {
        expect(
            catalogReducer(state, updateWorkflow({ sort, ...dataPayload }))
        ).toEqual({
            ...initialState,
            sort,
            ...dataPayload
        });
    });

    it('should add results when page is not first', () => {
        expect(
            catalogReducer(
                state,
                updateWorkflow({ sort, ...{ ...dataPayload, offset: 2 } })
            ).items
        ).toEqual(
            expect.arrayContaining([...dataPayload.items, ...state.items])
        );
    });

    it('should reset state', () => {
        expect(catalogReducer({ ...state, sort }, resetWorkflow())).toEqual({
            ...initialState,
            sort
        });
    });
});
