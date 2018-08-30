import inputOutput from './implementation/InputOutput';

function InputOutputProps(group, element, bpmnFactory, translate) {
    var inputOutputEntry = inputOutput(element, bpmnFactory, {}, translate);

    group.entries = group.entries.concat(inputOutputEntry.entries);

    return {
        getSelectedParameter: inputOutputEntry.getSelectedParameter
    };
}

export default InputOutputProps;
