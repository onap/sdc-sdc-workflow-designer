/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
 *      http://www.apache.org/licenses/LICENSE-2.0
*
 * Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

const mockActivities = {
    results: [
        { id: '', name: '' },
        { id: 1, name: 'activity1', value: 'activity1' },
        { id: 2, name: 'activity2', value: 'activity2' },
        { id: 3, name: 'activity3', value: 'activity3' }
    ]
};

const activitiesData = [
    {
        id: 1,
        name: 'activity1',
        inputParameters: [
            { name: 'param1', value: 'value1' },
            { name: 'param2', value: 'value2' }
        ]
    },
    {
        id: 2,
        name: 'activity2',
        inputParameters: [
            { name: 'param1', value: 'value1' },
            { name: 'param2', value: 'value2' }
        ]
    },
    {
        id: 3,
        name: 'activity3',
        inputParameters: [
            { name: 'param1', value: 'value1' },
            { name: 'param2', value: 'value2' }
        ]
    }
];

export default {
    fetchActivities: () => {
        return Promise.resolve(mockActivities);
    },
    fetchActivity: activity => {
        return Promise.resolve(
            activitiesData.find(el => el.id === activity.id)
        );
    }
};
