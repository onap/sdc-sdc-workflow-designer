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
import { call, takeEvery, put, select } from 'redux-saga/effects';

import { genericNetworkErrorAction } from 'wfapp/appConstants';
import overviewApi from 'features/workflow/overview/overviewApi';
import {
    versionListFetchAction,
    getVersionsAction,
    GET_OVERVIEW,
    UPDATE_WORKFLOW,
    ARCHIVE_WORKFLOW,
    RESTORE_WORKFLOW
} from 'features/workflow/overview/overviewConstansts';
import { setWorkflowAction } from 'features/workflow/workflowConstants';
import { notificationActions } from 'shared/notifications/notificationsActions';
import { fetchWorkflow } from 'features/catalog/catalogActions';
import { WORKFLOW_STATUS } from 'features/workflow/workflowConstants';
import { I18n } from 'react-redux-i18n';

export function* getOverview({ payload }) {
    try {
        const versions = yield call(overviewApi.getVersions, payload);
        yield put(versionListFetchAction(versions));
        const workflow = yield call(overviewApi.getWorkflow, payload);
        yield put(setWorkflowAction(workflow));
    } catch (error) {
        yield put(genericNetworkErrorAction(error));
    }
}

export function* updateWorkflow(action) {
    try {
        yield call(overviewApi.updateWorkflow, action.payload);
        yield put(
            notificationActions.showSuccess({
                title: I18n.t('workflow.overview.updateTitle'),
                message: I18n.t('workflow.overview.updateNotification')
            })
        );
    } catch (e) {
        yield put(genericNetworkErrorAction(e));
    }
}

export function* archiveRestoreWorkflow(action) {
    try {
        const { ...data } = action.payload;
        yield call(overviewApi.archiveRestoreWorkflow, data);
        const {
            catalog: { sort },
            searchNameFilter = ''
        } = yield select();

        yield put(
            fetchWorkflow({
                sort,
                searchNameFilter,
                status: WORKFLOW_STATUS.ACTIVE
            })
        );
    } catch (e) {
        yield put(genericNetworkErrorAction(e));
    }
}

export function* restoreWorkflow(action) {
    const { id } = action.payload;
    yield archiveRestoreWorkflow(action);
    yield put(getVersionsAction(id));
}

export function* archiveWorkflow(action) {
    const { history } = action.payload;
    yield archiveRestoreWorkflow(action);
    yield put(
        notificationActions.showSuccess({
            title: I18n.t('workflow.overview.archiveTitle'),
            message: I18n.t('workflow.overview.archiveNotification', {
                name: action.payload.name
            })
        })
    );
    history.push('/');
}

export function* watchOverview() {
    yield takeEvery(GET_OVERVIEW, getOverview);
    yield takeEvery(UPDATE_WORKFLOW, updateWorkflow);
    yield takeEvery(ARCHIVE_WORKFLOW, archiveWorkflow);
    yield takeEvery(RESTORE_WORKFLOW, restoreWorkflow);
}
