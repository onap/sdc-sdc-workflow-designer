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
import { call, put, takeEvery, all } from 'redux-saga/effects';
import { genericNetworkErrorAction } from 'src/appConstants';
import { GET_ACTIVITIES } from './activitiesConstants';
import activitiesApi from './activitiesApi';
import { setActivitiesList } from './activitiesActions';

function* fetchActivities() {
    try {
        const activitiesList = yield call(activitiesApi.fetchActivities);

        //     try {
        //         const activity = yield call(activitiesApi.fetchActivity, item.id);
        //         return activity;
        //     }
        //     catch {
        //         return {}
        //     }
        // } )
        const updatedList = yield all(
            activitiesList.items.map(item =>
                call(activitiesApi.fetchActivity, item.id)
            )
        );

        yield put(setActivitiesList(updatedList));
    } catch (error) {
        yield put(genericNetworkErrorAction(error));
    }
}

function* activitiesSaga() {
    yield takeEvery(GET_ACTIVITIES, fetchActivities);
}

export default activitiesSaga;
