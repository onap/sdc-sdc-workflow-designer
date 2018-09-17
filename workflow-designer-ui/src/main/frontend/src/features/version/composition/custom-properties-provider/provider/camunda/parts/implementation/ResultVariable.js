'use strict';
import { IMPLEMENTATION_TYPE_VALUE } from './implementationConstants';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import assign from 'lodash/assign';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

export default function(element, bpmnFactory, options, translate) {
    var getBusinessObject = options.getBusinessObject,
        hideResultVariable = options.hideResultVariable,
        id = options.id || 'resultVariable';

    var resultVariableEntry = entryFactory.textField({
        id: id,
        label: translate('Result Variable'),
        modelProperty: 'resultVariable',

        get: function(element) {
            var bo = getBusinessObject(element);
            return { resultVariable: bo.get('camunda:resultVariable') };
        },

        set: function(element, values) {
            var bo = getBusinessObject(element);

            var resultVariable = values.resultVariable || undefined;

            var props = {
                'camunda:resultVariable': resultVariable
            };

            if (is(bo, 'camunda:DmnCapable') && !resultVariable) {
                props = assign(
                    { 'camunda:mapDecisionResult': 'resultList' },
                    props
                );
            }

            return cmdHelper.updateBusinessObject(element, bo, props);
        },

        hidden: function(element) {
            const bo = getBusinessObject(element);
            if (
                is(bo, 'bpmn:ServiceTask') &&
                bo.implementation &&
                bo.implementation.indexOf(IMPLEMENTATION_TYPE_VALUE) > -1
            ) {
                return true;
            }
            if (typeof hideResultVariable === 'function') {
                return hideResultVariable.apply(resultVariableEntry, arguments);
            }
        }
    });

    return [resultVariableEntry];
}
