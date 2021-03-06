/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*http://www.apache.org/licenses/LICENSE-2.0
*
 * Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import { SET_COMPOSITION, DELETE_COMPOSITION } from './compositionConstants';
import { UPDATE_ERRORS } from './compositionConstants';
import newDiagramXML from './newDiagram.bpmn';

export default (state = { diagram: newDiagramXML, errors: [] }, action) => {
    switch (action.type) {
        case SET_COMPOSITION:
            return {
                ...state,
                diagram: action.payload
            };
        case DELETE_COMPOSITION:
            return {
                ...state,
                diagram: newDiagramXML
            };
        case UPDATE_ERRORS: {
            const filteredErrors = state.errors.filter(
                item => item.element.id !== action.payload.element.id
            );
            return {
                ...state,
                errors: [...filteredErrors, action.payload]
            };
        }
        default:
            return state;
    }
};
