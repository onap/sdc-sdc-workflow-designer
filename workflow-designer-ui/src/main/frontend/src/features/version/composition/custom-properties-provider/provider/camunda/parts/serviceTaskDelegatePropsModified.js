import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import ImplementationTypeHelper from 'bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper';
import { getActivitiesList } from 'features/activities/activitiesLocalStorageApi';
import ExtensionElementsHelper from 'bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper';
import ActivitiesHelper from './implementation/ActivitiesHelper';
function getBusinessObject(element) {
    return ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
}

function isServiceTaskLike(element) {
    return ImplementationTypeHelper.isServiceTaskLike(element);
}

module.exports = function(group, element, bpmnFactory, translate) {
    const bo = getBusinessObject(element);

    if (!isServiceTaskLike(bo)) {
        return;
    }
    if (bo.$attrs.selectedActivity) {
        console.log(
            'extension',
            ExtensionElementsHelper.getExtensionElements(
                bo,
                'camunda:InputOutput'
            )
        );

        if (
            !ExtensionElementsHelper.getExtensionElements(
                bo,
                'camunda:InputOutput'
            )
        ) {
            console.log('---no inputs');
            const cmd = ActivitiesHelper.setInputsOutputs(
                bo,
                bpmnFactory,
                element
            );

            if (cmd) {
                console.log(cmd);
            }
        }
    }
    group.entries.push(
        entryFactory.selectBox({
            id: 'implementation',
            label: translate('Implementation'),
            selectOptions: [{ value: 'activity', name: translate('activity') }],
            modelProperty: 'implType'
        })
    );
    const activitiesList = getActivitiesList();
    const activitiesSelector = entryFactory.selectBox({
        id: 'selectedActivity',
        label: translate('Selected activity'),
        selectOptions: activitiesList,
        modelProperty: 'selectedActivity'
    });
    group.entries.push(activitiesSelector);
};
