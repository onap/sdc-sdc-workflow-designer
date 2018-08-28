'use strict';
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper'),
    extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper'),
    inputOutputHelper = require('./InputOutputHelper'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var extensionElementsEntry = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation//ExtensionElements');

function getInputOutput(element, insideConnector) {
    return inputOutputHelper.getInputOutput(element, insideConnector);
}

function getConnector(element) {
    return inputOutputHelper.getConnector(element);
}

function getInputParameters(element, insideConnector) {
    return inputOutputHelper.getInputParameters(element, insideConnector);
}

function getOutputParameters(element, insideConnector) {
    return inputOutputHelper.getOutputParameters(element, insideConnector);
}

function getInputParameter(element, insideConnector, idx) {
    return inputOutputHelper.getInputParameter(element, insideConnector, idx);
}

function getOutputParameter(element, insideConnector, idx) {
    return inputOutputHelper.getOutputParameter(element, insideConnector, idx);
}

function createElement(type, parent, factory, properties) {
    const el = elementHelper.createElement(type, properties, parent, factory);
    return el;
}

function createInputOutput(parent, bpmnFactory, properties) {
    return createElement(
        'camunda:InputOutput',
        parent,
        bpmnFactory,
        properties
    );
}

function createParameter(type, parent, bpmnFactory, properties) {
    return createElement(type, parent, bpmnFactory, properties);
}

function ensureInputOutputSupported(element, insideConnector) {
    return inputOutputHelper.isInputOutputSupported(element, insideConnector);
}

function ensureOutparameterSupported(element, insideConnector) {
    return inputOutputHelper.areOutputParametersSupported(
        element,
        insideConnector
    );
}

module.exports = function(element, bpmnFactory, options, translate) {
    var TYPE_LABEL = {
        'camunda:Map': translate('Map'),
        'camunda:List': translate('List'),
        'camunda:Script': translate('Script')
    };

    options = options || {};

    var insideConnector = !!options.insideConnector,
        idPrefix = options.idPrefix || '';

    var getSelected = function(element, node) {
        var selection = (inputEntry &&
            inputEntry.getSelected(element, node)) || { idx: -1 };

        var parameter = getInputParameter(
            element,
            insideConnector,
            selection.idx
        );
        if (!parameter && outputEntry) {
            selection = outputEntry.getSelected(element, node);
            parameter = getOutputParameter(
                element,
                insideConnector,
                selection.idx
            );
        }
        return parameter;
    };

    var result = {
        getSelectedParameter: getSelected
    };

    var entries = (result.entries = []);

    if (!ensureInputOutputSupported(element)) {
        return result;
    }

    var newElement = function(type, prop, elementData) {
        return function(element, extensionElements, value) {
            var commands = [];

            var inputOutput = getInputOutput(element, insideConnector);
            if (!inputOutput) {
                var parent = !insideConnector
                    ? extensionElements
                    : getConnector(element);

                inputOutput = createInputOutput(parent, bpmnFactory, {
                    inputParameters: [],
                    outputParameters: []
                });

                if (!insideConnector) {
                    commands.push(
                        cmdHelper.addAndRemoveElementsFromList(
                            element,
                            extensionElements,
                            'values',
                            'extensionElements',
                            [inputOutput],
                            []
                        )
                    );
                } else {
                    commands.push(
                        cmdHelper.updateBusinessObject(element, parent, {
                            inputOutput: inputOutput
                        })
                    );
                }
            }

            var newElem = elementData
                ? createParameter(type, inputOutput, bpmnFactory, elementData)
                : createParameter(type, inputOutput, bpmnFactory, {
                      name: value
                  });

            console.log(newElem);

            commands.push(
                cmdHelper.addElementsTolist(element, inputOutput, prop, [
                    newElem
                ])
            );

            return commands;
        };
    };

    var removeElement = function(getter, prop, otherProp) {
        return function(element, extensionElements, value, idx) {
            var inputOutput = getInputOutput(element, insideConnector);
            var parameter = getter(element, insideConnector, idx);

            var commands = [];
            commands.push(
                cmdHelper.removeElementsFromList(
                    element,
                    inputOutput,
                    prop,
                    null,
                    [parameter]
                )
            );

            var firstLength = inputOutput.get(prop).length - 1;
            var secondLength = (inputOutput.get(otherProp) || []).length;

            if (!firstLength && !secondLength) {
                if (!insideConnector) {
                    commands.push(
                        extensionElementsHelper.removeEntry(
                            getBusinessObject(element),
                            element,
                            inputOutput
                        )
                    );
                } else {
                    var connector = getConnector(element);
                    commands.push(
                        cmdHelper.updateBusinessObject(element, connector, {
                            inputOutput: undefined
                        })
                    );
                }
            }

            return commands;
        };
    };

    var setOptionLabelValue = function(getter) {
        return function(element, node, option, property, value, idx) {
            var parameter = getter(element, insideConnector, idx);

            var suffix = 'Text';

            var definition = parameter.get('definition');
            if (typeof definition !== 'undefined') {
                var type = definition.$type;
                suffix = TYPE_LABEL[type];
            }

            option.text = (value || '') + ' : ' + suffix;
        };
    };

    // input parameters ///////////////////////////////////////////////////////////////

    var inputEntry = extensionElementsEntry(element, bpmnFactory, {
        id: idPrefix + 'inputs',
        label: translate('Input Parameters'),
        modelProperty: 'name',
        prefix: 'Input',
        resizable: true,

        createExtensionElement: inputOutputHelper.isCreateDeleteSupported(
            element
        )
            ? newElement('camunda:InputParameter', 'inputParameters')
            : undefined,
        removeExtensionElement: inputOutputHelper.isCreateDeleteSupported(
            element
        )
            ? removeElement(
                  getInputParameter,
                  'inputParameters',
                  'outputParameters'
              )
            : undefined,

        getExtensionElements: function(element) {
            return getInputParameters(element, insideConnector);
        },

        onSelectionChange: function(element, node) {
            outputEntry && outputEntry.deselect(element, node);
        },

        setOptionLabelValue: setOptionLabelValue(getInputParameter)
    });
    entries.push(inputEntry);

    // output parameters ///////////////////////////////////////////////////////

    if (ensureOutparameterSupported(element, insideConnector)) {
        var outputEntry = extensionElementsEntry(element, bpmnFactory, {
            id: idPrefix + 'outputs',
            label: translate('Output Parameters'),
            modelProperty: 'name',
            prefix: 'Output',
            resizable: true,

            createExtensionElement: inputOutputHelper.isCreateDeleteSupported(
                element
            )
                ? newElement('camunda:OutputParameter', 'outputParameters')
                : undefined,
            removeExtensionElement: inputOutputHelper.isCreateDeleteSupported(
                element
            )
                ? removeElement(
                      getOutputParameter,
                      'outputParameters',
                      'inputParameters'
                  )
                : inputOutputHelper.isCreateDeleteSupported(element),

            getExtensionElements: function(element) {
                return getOutputParameters(element, insideConnector);
            },

            onSelectionChange: function(element, node) {
                inputEntry.deselect(element, node);
            },

            setOptionLabelValue: setOptionLabelValue(getOutputParameter)
        });
        entries.push(outputEntry);
    }

    return result;
};
