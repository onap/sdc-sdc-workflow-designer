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
    versionStateChangedAction,
    FETCH_REQUESTED
} from 'features/version/versionConstants';
import { setInputsOutputs } from 'features/version/inputOutput/inputOutputActions';
import { SUBMIT_VERSION } from 'features/version/create/createVersionConstants';
import {
    SAVE_ACTION,
    CERTIFY_ACTION
} from 'features/version/versionController/versionControllerConstants';
import versionApi from 'features/version/versionApi';
import { notificationActions } from 'shared/notifications/notificationsActions';
import { versionState } from 'features/version/versionConstants';
import overviewApi from '../workflow/overview/overviewApi';
import { versionListFetchAction } from '../workflow/overview/overviewConstansts';
import { updateComposition } from 'features/version/composition/compositionActions';
import activitiesApi from 'features/activities/activitiesApi';
import { setActivitiesList } from 'features/activities/activitiesActions';

function* fetchVersion(action) {
    try {
        const data = yield call(versionApi.fetchVersion, action.payload);
        const { inputs, outputs, ...rest } = data;
        let composition = false;

        if (rest.hasArtifact) {
            composition = yield call(
                versionApi.fetchVersionArtifact,
                action.payload
            );
        }
        const activitiesList = yield call(activitiesApi.fetchActivities);
        yield all([
            put(setWorkflowVersionAction(rest)),
            put(setInputsOutputs({ inputs, outputs })),
            put(updateComposition(composition)),
            put(setActivitiesList(activitiesList.results))
        ]);
    } catch (error) {
        yield put(genericNetworkErrorAction(error));
    }
}

function* watchSubmitVersion(action) {
    try {
        const { workflowId, history } = action.payload;
        const data = yield call(versionApi.createNewVersion, action.payload);
        const versions = yield call(overviewApi.getVersions, workflowId);
        yield put(versionListFetchAction(versions));
        yield call(
            history.push('/workflow/' + workflowId + '/version/' + data.id)
        );
    } catch (error) {
        yield put(genericNetworkErrorAction(error));
    }
}

function* watchUpdateVersion(action) {
    try {
        //const { composition, ...versionData } = action.payload;
        const {
            workflowId,
            params: { composition, ...versionData }
        } = action.payload;
        yield call(versionApi.updateVersion, {
            workflowId,
            params: versionData
        });
        if (composition) {
            yield call(versionApi.updateVersionArtifact, {
                workflowId,
                versionId: versionData.id,
                payload: composition
            });
        }
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

function* watchCertifyVersion(action) {
    try {
        yield call(versionApi.certifyVersion, {
            ...action.payload
        });
        yield put(
            notificationActions.showSuccess({
                title: 'Certify Version',
                message: 'Successfully updated'
            })
        );
        yield put(versionStateChangedAction({ state: versionState.CERTIFIED }));
    } catch (error) {
        yield put(genericNetworkErrorAction(error));
    }
}

function* versionSaga() {
    yield takeLatest(FETCH_REQUESTED, fetchVersion);
    yield takeEvery(SUBMIT_VERSION, watchSubmitVersion);
    yield takeEvery(SAVE_ACTION, watchUpdateVersion);
    yield takeEvery(CERTIFY_ACTION, watchCertifyVersion);
}

export default versionSaga;
