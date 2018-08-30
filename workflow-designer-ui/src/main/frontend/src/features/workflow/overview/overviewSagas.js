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
import { call, takeEvery, put } from 'redux-saga/effects';

import { genericNetworkErrorAction } from 'appConstants';
import overviewApi from 'features/workflow/overview/overviewApi';
import {
    versionListFetchAction,
    GET_OVERVIEW,
    SELECT_VERSION,
    UPDATE_WORKFLOW
} from 'features/workflow/overview/overviewConstansts';
import { setWorkflowAction } from 'features/workflow/workflowConstants';
import { notificationActions } from 'shared/notifications/notificationsActions';
import { workflowVersionFetchRequestedAction } from 'features/version/versionConstants';

export function* getOverview(action) {
    try {
        const versions = yield call(overviewApi.getVersions, action.payload);
        yield put(versionListFetchAction(versions));
        const workflow = yield call(overviewApi.getWorkflow, action.payload);
        yield put(setWorkflowAction(workflow));
    } catch (error) {
        yield put(genericNetworkErrorAction(error));
    }
}

export function* setCurrentVersion(action) {
    try {
        yield put(workflowVersionFetchRequestedAction(action.payload));
    } catch (e) {
        yield put(genericNetworkErrorAction(e));
    }
}

export function* updateWorkflow(action) {
    try {
        yield call(overviewApi.updateWorkflow, action.payload);
        yield put(
            notificationActions.showSuccess({
                title: 'Update Workflow',
                message: 'Successfully updated'
            })
        );
    } catch (e) {
        yield put(genericNetworkErrorAction(e));
    }
}

export function* watchOverview() {
    yield takeEvery(GET_OVERVIEW, getOverview);
    yield takeEvery(SELECT_VERSION, setCurrentVersion);
    yield takeEvery(UPDATE_WORKFLOW, updateWorkflow);
}
