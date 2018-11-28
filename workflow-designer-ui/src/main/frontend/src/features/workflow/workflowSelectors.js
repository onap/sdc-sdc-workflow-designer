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
import { WORKFLOW_STATUS } from './workflowConstants';
export const getWorkflowName = state =>
    state && state.workflow.data.name && state.workflow.data.name;
export const getTrimWorkflowName = state =>
    state && state.workflow.data.name && state.workflow.data.name.trim();
export const getWorkflowId = state => state && state.workflow.data.id;
export const getWorkflowDescription = state =>
    state && state.workflow.data.description;
export const getWorkflowStatus = state =>
    state &&
    state.workflow &&
    state.workflow.data &&
    state.workflow.data.status;
export const isWorkflowArchive = state =>
    state &&
    state.workflow &&
    state.workflow.data &&
    state.workflow.data.archiving &&
    state.workflow.data.archiving === WORKFLOW_STATUS.ARCHIVE;
