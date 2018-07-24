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
import { call, put, takeLatest } from 'redux-saga/effects';

import catalogApi from 'features/catalog/catalogApi';
import { update, scroll } from 'features/catalog/catalogActions';

const noOp = () => {};

export function* fetchWorkflows({ payload }) {
    const { page, size, sort } = payload;

    const queryString = qs.stringify(
        {
            sort: Object.keys(sort).map(key => `${key},${sort[key]}`),
            size,
            page: page + 1
        },
        {
            indices: false,
            addQueryPrefix: true
        }
    );

    try {
        const data = yield call(catalogApi.getWorkflows, queryString);
        yield put(update(data));
    } catch (e) {
        noOp();
    }
}

function* catalogSaga() {
    yield takeLatest(scroll, fetchWorkflows);
}

export default catalogSaga;
