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

import qs from 'qs';
import { createSelector } from 'reselect';

export const getCatalog = state => state.catalog;

export const getWorkflows = createSelector(
    getCatalog,
    catalog => catalog.workflows
);

export const getSort = createSelector(getCatalog, catalog => catalog.sort);

export const getQueryString = createSelector(
    [getCatalog, getWorkflows],
    (catalog, workflows) => {
        const { sort, page } = catalog;
        const { limit } = workflows;

        const query = {
            sort: qs
                .stringify(sort, {
                    delimiter: ','
                })
                .replace(/=/g, ':'),
            limit,
            offset: page
        };

        const queryString = qs.stringify(query, { addQueryPrefix: true }); // eslint-disable-line

        return queryString; // `?_limit=${limit}&_page=${page}&_sort=name&_order=${sort.name}`;
    }
);
