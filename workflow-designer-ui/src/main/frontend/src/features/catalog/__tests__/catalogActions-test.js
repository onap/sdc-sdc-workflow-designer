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

'use strict';

import {
    FETCH_WORKFLOW,
    UPDATE_WORKFLOW,
    RESET_WORKFLOW,
    LIMIT,
    NAME,
    ASC
} from 'features/catalog/catalogConstants';
import {
    fetchWorkflow,
    updateWorkflow,
    resetWorkflow
} from 'features/catalog/catalogActions';

describe('Catalog Actions', () => {
    it('should have `fetchWorkflow` action', () => {
        const sort = { [NAME]: ASC };
        const offset = 0;

        expect(fetchWorkflow(sort, offset)).toEqual({
            type: FETCH_WORKFLOW,
            payload: {
                sort,
                limit: LIMIT,
                offset
            }
        });
    });

    it('should have `updateWorkflow` action', () => {
        const payload = {
            paging: {
                offset: 1,
                limit: 1,
                count: 1,
                hasMore: false,
                total: 2
            },
            items: [],
            sort: {
                name: 'asc'
            }
        };

        expect(updateWorkflow(payload)).toEqual({
            type: UPDATE_WORKFLOW,
            payload
        });
    });

    it('should have `resetWorkflow` action', () => {
        expect(resetWorkflow()).toEqual({
            type: RESET_WORKFLOW
        });
    });
});
