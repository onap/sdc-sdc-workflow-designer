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
import {
    SET_CURRENT_VERSION,
    DETAILS_CHANGED,
    VERSION_STATE_CHANGED
} from 'features/version/versionConstants';
const initialState = {};

function versionReducer(state = initialState, action) {
    switch (action.type) {
        case SET_CURRENT_VERSION:
            return action.payload;
        case DETAILS_CHANGED:
            return {
                ...state,
                ...action.payload
            };
        case VERSION_STATE_CHANGED:
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
}

export default versionReducer;
