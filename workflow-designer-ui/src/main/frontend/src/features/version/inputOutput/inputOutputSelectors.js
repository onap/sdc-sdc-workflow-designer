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
import isEmpty from 'lodash.isempty';

import { INPUTS } from 'features/version/inputOutput/inputOutputConstants';

export const getInputOutput = state => state.currentVersion.inputOutput;
export const getInputs = createSelector(getInputOutput, data => data.inputs);
export const getOutputs = createSelector(getInputOutput, data => data.outputs);
export const getCurrent = createSelector(
    getInputOutput,
    inputOutput => inputOutput.current
);

export const getIsShowInputs = createSelector(
    getCurrent,
    current => current === INPUTS
);

export const getSearch = createSelector(
    getInputOutput,
    inputOutput => inputOutput.search
);

export const getDataRows = createSelector(
    [getInputOutput, getCurrent],
    (inputOutput, current) => {
        if (inputOutput.search) {
            return inputOutput[current].filter(dataRow =>
                dataRow.name
                    .toLowerCase()
                    .includes(inputOutput.search.toLowerCase())
            );
        }

        return inputOutput[current];
    }
);

export const getTypes = createSelector(
    getInputOutput,
    inputOutput => inputOutput.types
);

export const getError = createSelector(
    [getInputOutput, getCurrent],
    (inputOutput, current) => inputOutput.error[current]
);

export const getErrorsInputOutput = createSelector(
    getInputOutput,
    ({ error }) => error
);

export const getInputErrors = createSelector(
    getErrorsInputOutput,
    ({ inputs }) =>
        !isEmpty(inputs) &&
        Boolean(
            inputs.alreadyExists.length ||
                inputs.invalidCharacters.length ||
                inputs.emptyName.length
        )
);

export const getOutputErrors = createSelector(
    getErrorsInputOutput,
    ({ outputs }) =>
        !isEmpty(outputs) &&
        Boolean(
            outputs.alreadyExists.length ||
                outputs.invalidCharacters.length ||
                outputs.emptyName.length
        )
);

export const getIOErrors = createSelector(
    getInputErrors,
    getOutputErrors,
    (inputsErrors, outputsErrors) => inputsErrors || outputsErrors
);
