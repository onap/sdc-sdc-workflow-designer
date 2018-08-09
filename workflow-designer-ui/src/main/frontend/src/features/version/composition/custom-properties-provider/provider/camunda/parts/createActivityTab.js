import activityProps from './activityProps';
import { getActivitiesList } from 'features/activities/activitiesLocalStorageApi';
function createActivityTabGroups(element) {
    // Create a group called "Black Magic".
    var activitesGroup = {
        id: 'activites',
        label: 'Activities',
        entries: []
    };

    //const selectOptions = JSON.parse(localStorage.getItem('activitiesList'));
    const selectOptions = getActivitiesList();
    // const selectOptions = [
    //     {
    //         name: 'activity1',
    //         value: 'activity1'
    //     },
    //     { name: 'activity2', value: 'activity2' }
    // ];

    activityProps(activitesGroup, element, selectOptions);

    return [activitesGroup];
}

export default createActivityTabGroups;
