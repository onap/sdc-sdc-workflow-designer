import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';

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
            return { workflowActivity: bo.get('camunda:workflowActivity') };
        },

        set: function(element, values) {
            var bo = getBusinessObject(element);
            config.onChange(bo, values.workflowActivity);
            const commands = [];
            commands.push(
                cmdHelper.updateBusinessObject(element, bo, {
                    'camunda:workflowActivity': values.workflowActivity
                })
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
