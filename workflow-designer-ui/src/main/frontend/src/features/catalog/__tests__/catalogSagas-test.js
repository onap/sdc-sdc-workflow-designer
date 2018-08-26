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

import { runSaga } from 'redux-saga';
import { takeLatest, throttle } from 'redux-saga/effects';

import {
    NAME,
    DESC,
    LIMIT,
    SEARCH_CHANGED,
    SEARCH_BUFFER
} from 'features/catalog/catalogConstants';
import catalogApi from '../catalogApi';
import { fetchWorkflow, updateWorkflow } from 'features/catalog/catalogActions';
import catalogSaga, { fetchWorkflowSaga } from 'features/catalog/catalogSagas';

jest.mock('../catalogApi');

describe('Catalog Sagas', () => {
    it('should watch for `fetchWorkflow` action', () => {
        const gen = catalogSaga();

        expect(gen.next().value).toEqual(
            takeLatest(fetchWorkflow, fetchWorkflowSaga)
        );

        expect(gen.next().value).toEqual(
            throttle(SEARCH_BUFFER, SEARCH_CHANGED, fetchWorkflowSaga)
        );
        expect(gen.next().done).toBe(true);
    });

    it('should get workflows and put `updateWorkflow` action', async () => {
        const sort = {
            [NAME]: DESC
        };
        const offset = 0;
        const searchNameFilter = undefined;
        const data = {
            paging: {
                offset,
                limit: 10,
                count: 2,
                hasMore: false,
                total: 2
            },
            searchNameFilter: 'w',
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
        const dispatched = [];

        catalogApi.getWorkflows.mockReturnValue(data);

        await runSaga(
            {
                dispatch: action => dispatched.push(action)
            },
            fetchWorkflowSaga,
            fetchWorkflow(sort, offset)
        ).done;

        expect(dispatched).toEqual(
            expect.arrayContaining([updateWorkflow({ sort, ...data })])
        );

        expect(catalogApi.getWorkflows).toBeCalledWith(
            sort,
            LIMIT,
            offset + LIMIT,
            searchNameFilter
        );
    });
});
