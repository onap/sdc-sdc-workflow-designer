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
export const SET_COMPOSITION = 'composition/SET_COMPOSITION';
export const UPDATE_ERRORS = 'composition/UPDATE_ERRORS';

export const bpmnElementsTypes = {
    EXTENSION_ElEMENTS: 'bpmn:ExtensionElements',
    INPUT_OUTPUT: 'camunda:InputOutput',
    INPUT_PARAMETER: 'camunda:InputParameter',
    OUTPUT_PARAMETER: 'camunda:OutputParameter'
};

export const PROCESS_DEFAULT_ID = 'Process_1';

export const COMPOSITION_ERROR_COLOR = '#f0c2c2';
export const COMPOSITION_VALID_COLOR = 'white';

export const CAMUNDA_PANEL_INPUTS_NAMES = [
    'camunda-parameterType-text',
    'camunda-documentation',
    'camunda-name'
];
