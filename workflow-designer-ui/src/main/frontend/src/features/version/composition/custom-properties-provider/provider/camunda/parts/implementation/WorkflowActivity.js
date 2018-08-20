import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';

const workflowActivity = (
    element,
    bpmnFactory,
    options,
    translate,
    activities
) => {
    const { getImplementationType, getBusinessObject } = options;

    const isWorkflowActivity = element =>
        getImplementationType(element) === 'workflowActivity';

    const workflowActivityEntry = entryFactory.selectBox({
        id: 'activitySelect',
        label: translate('Activity'),
        selectOptions: activities,
        emptyParameter: true,
        modelProperty: 'workflowActivity',

        get: function(element) {
            var bo = getBusinessObject(element);
            return { workflowActivity: bo.get('camunda:workflowActivity') };
        },

        set: function(element, values) {
            var bo = getBusinessObject(element);
            return cmdHelper.updateBusinessObject(element, bo, {
                'camunda:workflowActivity': values.workflowActivity
            });
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
