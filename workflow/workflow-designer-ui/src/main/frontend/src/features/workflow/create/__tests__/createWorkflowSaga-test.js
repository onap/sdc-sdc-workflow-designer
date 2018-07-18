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

import { call, put, takeEvery } from 'redux-saga/effects';
import { watchWorkflow, watchSubmitWorkflow } from '../createWorkflowSaga';
import newWorkflowApi from '../createWorkflowApi';
import { SUBMIT_WORKFLOW } from '../createWorkflowConstants';
import {
    setWorkflowAction,
    clearWorkflowAction
} from 'features/workflow/workflowConstants';

describe('New workflow saga test', () => {
    it('Create new workflow', () => {
        const gen = watchWorkflow();
        expect(gen.next().value).toEqual(
            takeEvery(SUBMIT_WORKFLOW, watchSubmitWorkflow)
        );
        expect(gen.next().done).toEqual(true);
    });

    it('Submit new workflow', () => {
        const params = {
            payload: {
                name: 'workflow1',
                description: 'description'
            }
        };
        const gen = watchSubmitWorkflow(params);
        expect(gen.next().value).toEqual(
            call(newWorkflowApi.createNewWorkflow, params.payload)
        );
        expect(gen.next(params.payload).value).toEqual(
            put(clearWorkflowAction)
        );
        expect(gen.next().value).toEqual(
            put(setWorkflowAction(params.payload))
        );

        const error = {
            message: 'Error message'
        };
        expect(gen.throw(error).value).toEqual(put(clearWorkflowAction));
    });
});
