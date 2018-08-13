import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import { is } from 'bpmn-js/lib/util/ModelUtil';

export default function(group, element, selectOptions) {
    // Only return an entry, if the currently selected
    // element is a start event.

    if (is(element, 'bpmn:ServiceTask')) {
        group.entries.push(
            entryFactory.selectBox({
                id: 'activitySelect',
                label: 'Select activity',
                modelProperty: 'activity',
                selectOptions
            })
        );
    }
}
