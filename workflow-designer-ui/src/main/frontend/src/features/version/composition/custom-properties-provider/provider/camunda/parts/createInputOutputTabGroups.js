let inputOutputParameter = require('./InputOutputParameterProps');
let inputOutput = require('./InputOutputProps');
var is = require('bpmn-js/lib/util/ModelUtil').is;

var getInputOutputParameterLabel = function(param, translate) {
    if (is(param, 'camunda:InputParameter')) {
        return translate('Input Parameter');
    }

    if (is(param, 'camunda:OutputParameter')) {
        return translate('Output Parameter');
    }

    return '';
};

export default function createInputOutputTabGroups(
    element,
    bpmnFactory,
    elementRegistry,
    translate
) {
    var inputOutputGroup = {
        id: 'input-output',
        label: translate('Parameters'),
        entries: []
    };
    console.log('create io group');
    var options = inputOutput(
        inputOutputGroup,
        element,
        bpmnFactory,
        translate
    );

    var inputOutputParameterGroup = {
        id: 'input-output-parameter',
        entries: [],
        enabled: function(element, node) {
            return options.getSelectedParameter(element, node);
        },
        label: function(element, node) {
            var param = options.getSelectedParameter(element, node);
            return getInputOutputParameterLabel(param, translate);
        }
    };

    inputOutputParameter(
        inputOutputParameterGroup,
        element,
        bpmnFactory,
        options,
        translate
    );

    return [inputOutputGroup, inputOutputParameterGroup];
}
