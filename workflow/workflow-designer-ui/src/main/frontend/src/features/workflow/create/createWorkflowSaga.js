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
import { takeEvery, call, put } from 'redux-saga/effects';
import { SUBMIT_WORKFLOW } from 'features/workflow/create/createWorkflowConstants';
import {
    setWorkflowAction,
    clearWorkflowAction
} from 'features/workflow/workflowConstants';
import newWorkflowApi from 'features/workflow/create/createWorkflowApi';
import versionApi from 'features/version/versionApi';
import { genericNetworkErrorAction } from 'src/appConstants';
import { NEW_VERSION } from 'features/workflow/create/createWorkflowConstants';

export function* watchSubmitWorkflow(action) {
    try {
        const workflow = yield call(
            newWorkflowApi.createNewWorkflow,
            action.payload
        );
        //Calling to create empty version
        const workflowId = workflow.id;
        const { history } = action.payload;
        yield call(versionApi.createNewVersion, {
            workflowId,
            ...NEW_VERSION
        });
        yield call(history.push('/workflow/' + workflowId + '/overview'));
        yield put(setWorkflowAction(workflow));
    } catch (error) {
        yield put(clearWorkflowAction);
        yield put(genericNetworkErrorAction(error));
    }
}

export function* watchWorkflow() {
    yield takeEvery(SUBMIT_WORKFLOW, watchSubmitWorkflow);
}
