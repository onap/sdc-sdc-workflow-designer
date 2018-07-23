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

export const getGeneralDescription = state =>
    state && state.currentVersion.general.description;
export const getVersionInfo = state => state && state.currentVersion.general;

export const getIsCurrentVersionsCertified = createSelector(
    state =>
        state &&
        state.currentVersion.general.state.toLowerCase() === 'certified'
);

export const getCreationTime = state =>
    state && state.currentVersion.general.creationTime;

export const getMofificationTime = state =>
    state && state.currentVersion.general.modificationTime;

export const generalParamsSelector = createSelector(
    getGeneralDescription,
    description => {
        return {
            description
        };
    }
);
