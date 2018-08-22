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

import RestfulAPIUtil from 'services/restAPIUtil';
import Configuration from 'config/Configuration.js';

function baseUrl() {
    const restPrefix = Configuration.get('restPrefix');
    return `${restPrefix}/workflows`;
}

const Api = {
    getWorkflows: (sort, limit, offset, searchNameFilter) => {
        const queryParams = {
            sort: Object.keys(sort).map(key => `${key}:${sort[key]}`),
            limit,
            offset
        };
        if (searchNameFilter) queryParams.searchNameFilter = searchNameFilter;
        const queryString = qs.stringify(queryParams, {
            indices: false,
            addQueryPrefix: true
        });

        return RestfulAPIUtil.fetch(`${baseUrl()}${queryString}`);
    }
};

export default Api;
