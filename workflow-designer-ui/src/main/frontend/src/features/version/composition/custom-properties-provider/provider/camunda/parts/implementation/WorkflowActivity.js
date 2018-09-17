import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import {
    implementationType,
    IMPLEMENTATION_TYPE_VALUE,
    SERVICE_TASK_NAME
} from './implementationConstants';

const workflowActivity = (element, config, bpmnFactory, options, translate) => {
    const { getImplementationType, getBusinessObject } = options;

    const isWorkflowActivity = element =>
        getImplementationType(element) === 'workflowActivity';

    const workflowActivityEntry = entryFactory.selectBox({
        id: 'activitySelect',
        label: translate('Activity Spec'),
        selectOptions: config.activities,
        emptyParameter: true,
        modelProperty: 'workflowActivity',

        get: function(element) {
            var bo = getBusinessObject(element);
            const value = bo.get(implementationType.ACTIVITY);
            const activityValue =
                value && value.indexOf(IMPLEMENTATION_TYPE_VALUE) > -1
                    ? value.substr(IMPLEMENTATION_TYPE_VALUE.length)
                    : '';

            return {
                workflowActivity: activityValue
            };
        },

        set: function(element, values) {
            var bo = getBusinessObject(element);
            config.onChange(bo, values.workflowActivity);
            const commands = [];
            const dataForUpdate = {};

            dataForUpdate[
                implementationType.ACTIVITY
            ] = `${IMPLEMENTATION_TYPE_VALUE}${values.workflowActivity}`;

            dataForUpdate[implementationType.EXPRESSION] =
                implementationType.EXPRESSION_VALUE;

            dataForUpdate[SERVICE_TASK_NAME] = values.workflowActivity;

            commands.push(
                cmdHelper.updateBusinessObject(element, bo, dataForUpdate)
            );
            return commands;
        },

        validate: function(element, values) {
            return isWorkflowActivity(element) && !values.workflowActivity
                ? { workflowActivity: 'Must provide a value' }
                : {};
        },

        hidden: function(element) {
            return !isWorkflowActivity(element);
        }
    });

    return [workflowActivityEntry];
};

export default workflowActivity;
