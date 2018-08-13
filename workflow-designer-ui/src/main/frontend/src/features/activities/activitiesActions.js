import { SET_ACTIVITIES_LIST } from './activitiesConstants';
import {
    setActivitiesList as setActivitiesListToStorage,
    setActivitiesDataToLocalStorage
} from './activitiesLocalStorageApi';

export const setActivitiesList = payload => {
    setActivitiesListToStorage(payload);
    setActivitiesDataToLocalStorage(payload);
    return {
        type: SET_ACTIVITIES_LIST,
        payload
    };
};
