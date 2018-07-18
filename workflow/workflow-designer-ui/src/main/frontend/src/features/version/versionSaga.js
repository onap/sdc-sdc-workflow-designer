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
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';

import { genericNetworkErrorAction } from 'src/appConstants';
import { setWorkflowVersionAction, FETCH_REQUESTED } from './versionConstants';
import { SUBMIT_VERSION } from './create/createVersionConstants';
import versionApi from './versionApi';

function* fetchVersion(action) {
    try {
        const data = yield call(versionApi.fetchVersion, action.payload);
        yield put(setWorkflowVersionAction(data));
    } catch (error) {
        yield put(genericNetworkErrorAction(error));
    }
}

function* watchSubmitVersion(action) {
    try {
        const { workflowId, history } = action.payload;
        const data = yield versionApi.createNewVersion(action.payload);
        yield call(history.push('/workflow/' + workflowId + '/version/'));
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

function* versionSaga() {
    yield takeLatest(FETCH_REQUESTED, fetchVersion);
    yield takeEvery(SUBMIT_VERSION, watchSubmitVersion);
}

export default versionSaga;
