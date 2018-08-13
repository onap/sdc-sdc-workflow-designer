import activitiesApi from './activitiesApi';

export const setActivitiesList = activitiesList =>
    localStorage.setItem('activitiesList', JSON.stringify(activitiesList));

export const getActivitiesList = () =>
    JSON.parse(localStorage.getItem('activitiesList'));

export const setActivitiesDataToLocalStorage = async activitiesList => {
    let activityData = [];
    await activitiesList.map(async item => {
        const data = await activitiesApi.fetchActivity(item);
        activityData.push(data);
    });
    localStorage.setItem('activityData', JSON.stringify(activityData));

    return Promise.resolve();
};

export const getActivityFromStorage = activity => {
    const data = JSON.parse(localStorage.getItem('activityData'));
    return data.find(item => item.id === activity.id);
};
