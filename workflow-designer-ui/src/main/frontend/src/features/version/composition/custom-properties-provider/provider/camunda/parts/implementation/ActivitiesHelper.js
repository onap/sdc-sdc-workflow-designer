import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper';
import ExtensionElementsHelper from 'bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

function getElements(bo, type, prop) {
    var elems = ExtensionElementsHelper.getExtensionElements(bo, type) || [];
    return !prop ? elems : (elems[0] || {})[prop] || [];
}

const INPUT = 'camunda:InputParameter';
const OUTPUT = 'camunda:InputParameter';

const createInputOutputParameter = (type, data, bo, bpmnFactory) =>
    elementHelper.createElement(type, data, bo, bpmnFactory);

export default {
    getActivities: element => {
        let bo = getBusinessObject(element);
        return (getElements(bo, 'camunda:Activity') || [])[0];
    },

    getSelectedActivity: bo => {
        return bo.$attrs.selectedActivity;
    },

    setInputsOutputs: (bo, bpmnFactory, element) => {
        console.log('bo from setInputOutput', bo);
        const inputParameter = createInputOutputParameter(
            INPUT,
            { name: 'createdInput', type: 'text', value: 'teeest' },
            bo,
            bpmnFactory
        );
        const outputParameter = createInputOutputParameter(
            OUTPUT,
            { name: 'createdOutput', type: 'text', value: 'teeest' },
            bo,
            bpmnFactory
        );

        const inputOutput = elementHelper.createElement(
            'camunda:InputOutput',
            {
                inputParameters: [inputParameter],
                outputParameters: [outputParameter]
            },
            element,
            bpmnFactory
        );
        console.log(inputOutput);
        const newExtension = ExtensionElementsHelper.addEntry(
            bo,
            'camunda:InputOutput',
            inputOutput,
            bpmnFactory
        );
        console.log('adding extension', newExtension);
        console.log(bo.extensionElements);
        if (!bo.extensionElements) {
            bo.extensionElements = newExtension.extensionElements;
            return false;
        }
        return newExtension;

        // if (newExtension) {
        //     bo.extensionElements = newExtension.extensionElements;
        // }
    }
};
