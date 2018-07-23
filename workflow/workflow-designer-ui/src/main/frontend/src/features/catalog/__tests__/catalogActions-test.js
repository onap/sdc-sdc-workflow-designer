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

import {
    UPDATE,
    SCROLL,
    SORT,
    LIMIT,
    NAME,
    ASC
} from 'features/catalog/catalogConstants';
import { update, scroll, sort } from 'features/catalog/catalogActions';

describe('Catalog Actions', () => {
    it('show have `update` action', () => {
        expect(update()).toEqual({
            type: UPDATE
        });
    });

    it('show have `scroll` action', () => {
        const page = 1;
        const sort = {};

        const expected = {
            type: SCROLL,
            payload: {
                page,
                sort,
                size: LIMIT
            }
        };

        expect(scroll(page, sort)).toEqual(expected);
    });

    it('show have `sort` action', () => {
        const sortPayload = {
            [NAME]: ASC
        };

        const expected = {
            type: SORT,
            payload: {
                sort: sortPayload
            }
        };

        expect(sort(sortPayload)).toEqual(expected);
    });
});
