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
import { I18n } from 'react-redux-i18n';

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
import {
    updateComposition,
    deleteCompositionArtifact
} from 'features/version/composition/compositionActions';
import { getActivitiesList } from 'features/activities/activitiesActions';

/**
 * Composition validation - converting artifact string to xml
 * and checking if bpmn diagram has only one child
 * @param composition
 * @returns {boolean}
 */
function validateCurrentArtifact(composition) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(composition, 'text/xml');
    return Boolean(
        xml.getElementsByTagName('bpmndi:BPMNPlane').BPMNPlane_1.children.length
    );
}

function* fetchVersion(action) {
    try {
        yield put(getActivitiesList());
        const data = yield call(versionApi.fetchVersion, action.payload);
        const { inputs, outputs, ...rest } = data;
        let composition;

        if (rest.hasArtifact) {
            composition = yield call(
                versionApi.fetchVersionArtifact,
                action.payload
            );
        } else {
            //Clearing the store from old artifact using init the default
            yield put(deleteCompositionArtifact());
        }
        yield all([
            put(setWorkflowVersionAction(rest)),
            put(setInputsOutputs({ inputs, outputs })),
            composition && put(updateComposition(composition))
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
        const {
            workflowId,
            workflowName,
            params: { composition, ...versionData }
        } = action.payload;
        const isArtifactValid = validateCurrentArtifact(composition);
        if (isArtifactValid) {
            yield call(versionApi.updateVersion, {
                workflowId,
                params: versionData
            });
            yield call(versionApi.updateVersionArtifact, {
                workflowId,
                workflowName,
                versionName: versionData.name.split('.').join('_'),
                versionId: versionData.id,
                payload: composition
            });
            yield put(
                notificationActions.showSuccess({
                    title: I18n.t('workflow.confirmationMessages.updateTitle'),
                    message: I18n.t(
                        'workflow.confirmationMessages.updateMessage'
                    )
                })
            );
        } else {
            yield call(versionApi.deleteVersionArtifact, {
                workflowId,
                versionId: versionData.id
            });
        }
        return isArtifactValid;
    } catch (error) {
        yield put(genericNetworkErrorAction(error));
    }
}

function* watchCertifyVersion(action) {
    try {
        const isArtifactValid = yield call(watchUpdateVersion, action);
        if (!isArtifactValid)
            throw new Error('Could not update empty artifact');
        yield call(versionApi.certifyVersion, {
            ...action.payload
        });
        yield put(versionStateChangedAction({ state: versionState.CERTIFIED }));
        yield put(
            notificationActions.showSuccess({
                title: I18n.t('workflow.confirmationMessages.certifyTitle'),
                message: I18n.t('workflow.confirmationMessages.certifyMessage')
            })
        );
    } catch (error) {
        yield put(
            notificationActions.showError({
                title: I18n.t('workflow.confirmationMessages.certifyTitle'),
                message: I18n.t('workflow.composition.certifyArtifact')
            })
        );
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
