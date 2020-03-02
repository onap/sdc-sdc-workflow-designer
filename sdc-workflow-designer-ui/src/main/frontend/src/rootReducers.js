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

import { combineReducers } from 'redux';
import { i18nReducer } from 'react-redux-i18n';

import catalog from 'features/catalog/catalogReducer';
import inputOutput from 'features/version/inputOutput/inputOutputReducer';
import notificationsReducer from 'shared/notifications/notificationsReducer';
import versionReducer from 'features/version/versionReducer';
import loader from 'shared/loader/LoaderReducer';
import modal from 'shared/modal/modalWrapperReducer';
import overviewReducer from 'features/workflow/overview/overviewReducer';
import workflowReducer from 'features/workflow/workflowReducer';
import compositionReducer from 'features/version/composition/compositionReducer';
import activitiesReducer from 'features/activities/activitiesReducer';
import operationModeReducer from 'features/version/versionModeReducer';
import pluginContextReducer from './pluginContext/pluginContextReducer';

export default combineReducers({
    i18n: i18nReducer,
    catalog,
    notifications: notificationsReducer,
    currentVersion: combineReducers({
        general: versionReducer,
        inputOutput,
        composition: compositionReducer,
        operationMode: operationModeReducer
    }),
    workflow: combineReducers({
        data: workflowReducer,
        versions: overviewReducer
    }),
    pluginContext: pluginContextReducer,
    activities: activitiesReducer,
    loader,
    modal
});
