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

import { createSelector } from 'reselect';
import { getWorkflowParams } from '../create/createWorkflowSelector';
import dateformat from 'dateformat';

export const getVersions = state => state && state.workflow.versions.results;
export const getSelectedVersionId = state =>
    state && state.workflow.currentVersion.id;
export const getWorkflowCreationTime = state =>
    state && state.workflow.data.creationTime;

export const getWorkflowModificationTime = state =>
    state && state.workflow.data.modificationTime;

export const getWorkflowId = state => state && state.workflow.data.id;

export const getIsVersionsCertifies = createSelector(
    getVersions,
    versions =>
        versions &&
        versions.filter(version => version.status.toLowerCase() === 'certified')
            .length === versions.length
);

export const getWorkflowData = createSelector(
    getWorkflowParams,
    getWorkflowCreationTime,
    getWorkflowModificationTime,
    getWorkflowId,
    (params, creationTime, modificationTime, id) => {
        const created = dateformat(creationTime, 'dd/mm/yy h:MM');
        const modified = dateformat(modificationTime, 'dd/mm/yy h:MM');
        return {
            ...params,
            created,
            modified,
            id
        };
    }
);

export const getLatestBaseId = createSelector(
    getVersions,
    versions => versions.length && versions[versions.length - 1].baseId
);
