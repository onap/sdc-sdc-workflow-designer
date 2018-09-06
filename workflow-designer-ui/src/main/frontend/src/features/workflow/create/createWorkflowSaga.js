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
import { I18n } from 'react-redux-i18n';

import {
    SUBMIT_WORKFLOW,
    NEW_VERSION,
    MAX_NAME_LENGTH,
    MIN_NAME_LENGTH,
    CHARS_VALIDATION_EXP,
    putValidationError
} from 'features/workflow/create/createWorkflowConstants';
import {
    setWorkflowAction,
    clearWorkflowAction
} from 'features/workflow/workflowConstants';
import { hideModalAction } from 'shared/modal/modalWrapperActions';
import newWorkflowApi from 'features/workflow/create/createWorkflowApi';
import { genericNetworkErrorAction } from 'appConstants';
import { submitVersionAction } from 'features/version/create/createVersionConstants';

export function* watchSubmitWorkflow(action) {
    try {
        const { name } = action.payload;
        const validationError = yield validateNameField(name);
        if (validationError) {
            yield put(putValidationError(validationError));
        } else {
            const workflow = yield call(
                newWorkflowApi.createNewWorkflow,
                action.payload
            );
            //Calling to create empty version
            const workflowId = workflow.id;
            const { history } = action.payload;
            yield put(
                submitVersionAction({ history, workflowId, ...NEW_VERSION })
            );
            yield put(setWorkflowAction(workflow));
            yield put(hideModalAction());
        }
    } catch (error) {
        yield put(clearWorkflowAction);
        yield put(genericNetworkErrorAction(error));
    }
}

export function validateNameField(name) {
    let errorMessage;
    if (!name) {
        errorMessage = I18n.t('workflow.errorMessages.emptyName');
    } else if (!CHARS_VALIDATION_EXP.test(name)) {
        errorMessage = I18n.t('workflow.errorMessages.invalidCharacters');
    } else if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
        errorMessage = I18n.t('workflow.errorMessages.nameFieldLength', {
            minValue: 6,
            maxValue: 40
        });
    }
    return errorMessage;
}

export function* watchWorkflow() {
    yield takeEvery(SUBMIT_WORKFLOW, watchSubmitWorkflow);
}
