import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import ImplementationTypeHelper from 'bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper';
import { getActivitiesList } from 'features/activities/activitiesLocalStorageApi';
function getBusinessObject(element) {
    return ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
}

function isServiceTaskLike(element) {
    return ImplementationTypeHelper.isServiceTaskLike(element);
}

module.exports = function(group, element, bpmnFactory, translate) {
    console.log(bpmnFactory);
    if (!isServiceTaskLike(getBusinessObject(element))) {
        return;
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
    group.entries.push(
        entryFactory.selectBox({
            id: 'selectedActivity',
            label: translate('Selected activity'),
            selectOptions: activitiesList,
            modelProperty: 'selectedActivity'
        })
    );
};
