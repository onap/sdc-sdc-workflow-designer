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

import catalogReducer, { initialState } from 'features/catalog/catalogReducer';
import { update } from 'features/catalog/catalogActions';

describe('Catalog Reducer', () => {
    it('returns the initial state', () => {
        expect(catalogReducer(undefined, {})).toEqual(initialState);
    });

    it('returns correct state for workflows update action', () => {
        const payload = {
            total: 2,
            size: 100,
            page: 0,
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
        };

        const action = update(payload);

        expect(catalogReducer(initialState, action).workflows).toEqual(payload);
    });
});
