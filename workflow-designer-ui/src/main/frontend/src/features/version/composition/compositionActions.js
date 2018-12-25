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
import {
    SET_COMPOSITION,
    UPDATE_ERRORS,
    DELETE_COMPOSITION
} from './compositionConstants';

export const updateComposition = payload => ({
    type: SET_COMPOSITION,
    payload
});

export const deleteCompositionArtifact = () => ({
    type: DELETE_COMPOSITION
});

export const updateValidation = payload => ({
    type: UPDATE_ERRORS,
    payload
});
