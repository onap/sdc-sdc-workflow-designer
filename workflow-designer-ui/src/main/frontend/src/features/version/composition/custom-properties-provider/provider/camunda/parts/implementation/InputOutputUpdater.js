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

import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { createInputOutput, createElement } from './InputOutput';
import InputOutputHelper from './InputOutputHelper';
import { INPUT, OUTPUT } from './implementationConstants';

export default ({ element, bo, bpmnFactory, activityInputsOutputs }) => {
    const commands = [];
    const existedInputOutput = InputOutputHelper.getInputOutput(element);

    let newInputOutput = createInputOutput(element, bpmnFactory, {
        inputParameters: [],
        outputParameters: []
    });

    const inputs = activityInputsOutputs.inputs.map(({ name, value }) =>
        createElement(INPUT, newInputOutput, bpmnFactory, {
            name,
            type: 'Text',
            value
        })
    );

    const outputs = activityInputsOutputs.inputs.map(({ name, value }) =>
        createElement(OUTPUT, newInputOutput, bpmnFactory, {
            name,
            type: 'Text',
            value
        })
    );

    newInputOutput.inputParameters = inputs;
    newInputOutput.outputParameters = outputs;

    const objectToRemove = existedInputOutput ? [existedInputOutput] : [];
    const extensionElements =
        bo.extensionElements ||
        createElement('bpmn:ExtensionElements', bo, bpmnFactory, []);

    if (!bo.extensionElements) {
        commands.push(
            cmdHelper.updateBusinessObject(element, bo, {
                extensionElements
            })
        );
    }

    commands.push(
        cmdHelper.addAndRemoveElementsFromList(
            element,
            extensionElements,
            'values',
            'extensionElements',
            [newInputOutput],
            objectToRemove
        )
    );
    return commands;
};
