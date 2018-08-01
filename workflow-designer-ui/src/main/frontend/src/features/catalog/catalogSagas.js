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

import { call, put, takeLatest } from 'redux-saga/effects';

import catalogApi from 'features/catalog/catalogApi';
import { fetchWorkflow, updateWorkflow } from 'features/catalog/catalogActions';

const noOp = () => {};

export function* fetchWorkflowSaga({ payload }) {
    const { sort, limit, offset } = payload;

    try {
        const data = yield call(
            catalogApi.getWorkflows,
            sort,
            limit,
            offset === undefined ? 0 : offset + limit
        );

        yield put(updateWorkflow({ sort, ...data }));
    } catch (e) {
        noOp();
    }
}

function* catalogSaga() {
    yield takeLatest(fetchWorkflow, fetchWorkflowSaga);
}

export default catalogSaga;
