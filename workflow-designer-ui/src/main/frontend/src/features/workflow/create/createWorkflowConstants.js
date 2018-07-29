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

export const NEW_VERSION = {
    baseId: null,
    description: null
};
export const WORKFLOW_INPUT_CHANGE = 'createWorkflow/INPUT_CHANGE';
export const SUBMIT_WORKFLOW = 'createWorkflow/SUBMIT_WORKFLOW';

export const inputChangeAction = payload => ({
    type: WORKFLOW_INPUT_CHANGE,
    payload
});

export const submitWorkflowAction = payload => ({
    type: SUBMIT_WORKFLOW,
    payload
});
