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
import { all, call, put, takeEvery, takeLatest } from 'redux-saga/effects';

import { genericNetworkErrorAction } from 'src/appConstants';
import {
    setWorkflowVersionAction,
    FETCH_REQUESTED
} from 'features/version/versionConstants';
import { setInputsOutputs } from 'features/version/inputOutput/inputOutputActions';
import { SUBMIT_VERSION } from 'features/version/create/createVersionConstants';
import { SAVE_ACTION } from 'features/version/versionController/versionControllerConstants';
import versionApi from 'features/version/versionApi';
import { notificationActions } from 'shared/notifications/notificationsActions';

function* fetchVersion(action) {
    try {
        const data = yield call(versionApi.fetchVersion, action.payload);
        const { inputs, outputs, ...rest } = data;

        yield all([
            put(setWorkflowVersionAction(rest)),
            put(setInputsOutputs({ inputs, outputs }))
        ]);
    } catch (error) {
        yield put(genericNetworkErrorAction(error));
    }
}

function* watchSubmitVersion(action) {
    try {
        const { workflowId, history } = action.payload;
        const data = yield call(versionApi.createNewVersion, action.payload);
        yield call(history.push('/workflow/' + workflowId + '/version/'));
        console.log(data);
    } catch (error) {
        yield put(genericNetworkErrorAction(error));
    }
}

function* watchUpdateVersion(action) {
    try {
        yield call(versionApi.updateVersion, action.payload);
        yield put(
            notificationActions.showSuccess({
                title: 'Update Workflow Version',
                message: 'Successfully updated'
            })
        );
    } catch (error) {
        yield put(genericNetworkErrorAction(error));
    }
}

function* versionSaga() {
    yield takeLatest(FETCH_REQUESTED, fetchVersion);
    yield takeEvery(SUBMIT_VERSION, watchSubmitVersion);
    yield takeEvery(SAVE_ACTION, watchUpdateVersion);
}

export default versionSaga;
