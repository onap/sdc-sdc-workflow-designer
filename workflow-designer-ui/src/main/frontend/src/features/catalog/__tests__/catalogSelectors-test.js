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

import {
    getCatalog,
    getWorkflows,
    getSort,
    getQueryString
} from 'features/catalog/catalogSelectors';

describe('Catalog Selectors', () => {
    const catalog = {
        page: -1,
        workflows: {
            total: 2,
            limit: 0,
            offset: 0,
            results: [
                {
                    id: '755eab7752374a2380544065b59b082d',
                    name: 'Alfa',
                    description: 'description description 1',
                    category: null
                },
                {
                    id: 'ef8159204dac4c10a85b29ec30b4bd56',
                    name: 'Bravo',
                    description: 'description description 2',
                    category: null
                }
            ]
        },
        sort: {
            name: 'ASC',
            date: 'DESC'
        }
    };

    it('returns catalog', () => {
        const state = { catalog };

        expect(getCatalog(state)).toEqual(catalog);
    });

    it('returns catalog workflows', () => {
        const state = { catalog };

        expect(getWorkflows(state)).toEqual(catalog.workflows);
    });

    it('returns catalog sort', () => {
        const state = { catalog };

        expect(getSort(state)).toEqual(catalog.sort);
    });
});
