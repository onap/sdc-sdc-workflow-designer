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

function getExtension(element, type) {
    if (!element.extensionElements || !element.extensionElements.values) {
        return null;
    }

    return element.extensionElements.values.filter(function(e) {
        return e.$instanceOf(type);
    })[0];
}

export function updatedData(moddle, inputData, existingArray, type) {
    return inputData.map(item => {
        const existingInput = existingArray.find(el => el.name === item.name);
        return moddle.create(
            type,
            existingInput ? { ...item, value: existingInput.value } : item
        );
    });
}

export function setElementInputsOutputs(businessObject, inputOutput, moddle) {
    const { inputs = [], outputs = [] } = inputOutput;

    if (!businessObject.extensionElements) {
        businessObject.extensionElements = moddle.create(
            'bpmn:ExtensionElements'
        );
    }

    const existingInputOutput = getExtension(
        businessObject,
        'camunda:InputOutput'
    );

    const processInputs = updatedData(
        moddle,
        inputs,
        (existingInputOutput && existingInputOutput.inputParameters) || [],
        'camunda:InputParameter'
    );

    const processOutputs = updatedData(
        moddle,
        outputs,
        (existingInputOutput && existingInputOutput.outputParameters) || [],
        'camunda:OutputParameter'
    );

    const processInputOutput = moddle.create('camunda:InputOutput');
    processInputOutput.inputParameters = [...processInputs];
    processInputOutput.outputParameters = [...processOutputs];

    const extensionElements = businessObject.extensionElements.get('values');

    businessObject.extensionElements.set(
        'values',
        extensionElements
            .filter(item => item.$type !== 'camunda:InputOutput')
            .concat(processInputOutput)
    );
}
