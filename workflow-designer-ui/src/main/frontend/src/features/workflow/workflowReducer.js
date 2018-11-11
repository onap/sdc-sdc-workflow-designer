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
    WORKFLOW_INPUT_CHANGE,
    VALIDATION_ERROR,
    CLEAR_VALIDATION_ERROR
} from 'features/workflow/create/createWorkflowConstants';
import {
    SET_WORKFLOW,
    CLEAR_WORKFLOW_DATA
} from 'features/workflow/workflowConstants';

function workflowReducer(state = {}, action) {
    switch (action.type) {
        case WORKFLOW_INPUT_CHANGE:
            return {
                ...state,
                ...action.payload
            };
        case CLEAR_WORKFLOW_DATA:
            return {};
        case SET_WORKFLOW:
            return {
                ...action.payload
            };
        //TODO change it when BE is done
        // return {
        //     ...action.payload,
        //     status: 'archive'
        // };
        case VALIDATION_ERROR:
            return {
                ...state,
                error: action.payload
            };
        case CLEAR_VALIDATION_ERROR:
            return {
                ...state,
                error: ''
            };
        default:
            return state;
    }
}

export default workflowReducer;
