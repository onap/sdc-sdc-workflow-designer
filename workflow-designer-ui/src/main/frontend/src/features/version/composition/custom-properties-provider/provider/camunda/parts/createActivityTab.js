import activityProps from './activityProps';
import { getActivitiesList } from 'features/activities/activitiesLocalStorageApi';
function createActivityTabGroups(element) {
    var activitesGroup = {
        id: 'activites',
        label: 'Activities',
        entries: []
    };
    const selectOptions = getActivitiesList();
    activityProps(activitesGroup, element, selectOptions);

    return [activitesGroup];
}

export default createActivityTabGroups;
