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

import { all, fork } from 'redux-saga/effects';

import { initTranslationSaga } from 'i18n/translationSaga';
import catalogSaga from 'features/catalog/catalogSagas';
import { watchWorkflow } from 'features/workflow/create/createWorkflowSaga';
import { watchNotifications } from 'shared/notifications/notificationsSagas';
import versionSaga from 'features/version/versionSaga';
import activitiesSaga from 'features/activities/activitiesSaga';

import { watchOverview } from 'features/workflow/overview/overviewSagas';

export default function* rootSaga() {
    yield all([
        fork(initTranslationSaga),
        fork(catalogSaga),
        fork(watchWorkflow),
        fork(watchNotifications),
        fork(versionSaga),
        fork(watchOverview),
        fork(activitiesSaga)
    ]);
}
