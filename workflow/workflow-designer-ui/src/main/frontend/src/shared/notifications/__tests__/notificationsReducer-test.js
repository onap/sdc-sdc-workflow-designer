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
import notificationsReducer from '../notificationsReducer';
import { actionTypes } from '../notificationsConstants';

describe('Notifications Reducer', () => {
    it('Returns empty state array', () => {
        expect(notificationsReducer(undefined, {})).toEqual([]);
    });
    it('Add notification obj to the notification arr in store', () => {
        const action = {
            type: actionTypes.ADD_NOTIFICATION,
            payload: {
                title: 'Notification1',
                message: 'This is a test',
                type: 'info',
                id: '4a2b0038-e442-4ccb-b577-5d04eee6fdfb',
                timeout: 200
            }
        };
        expect(notificationsReducer([], action)).toEqual([action.payload]);
    });
    it('Remove notification instance from store', () => {
        const resultState = [
            {
                title: 'Notification1',
                message: 'This is a test',
                type: 'info',
                id: '4a2b0038-e442-4ccb-b577-5d04eee6fdfb',
                timeout: 200
            }
        ];
        const removeAction = {
            type: actionTypes.REMOVE_NOTIFICATION,
            payload: {
                title: 'Notification1',
                message: 'This is a test',
                type: 'info',
                id: '4a2b0038-e442-4ccb-b577-5d04eee6fdfb',
                timeout: 200
            }
        };
        expect(notificationsReducer([], removeAction)).toEqual([]);
        expect(notificationsReducer(resultState, removeAction)).toEqual(
            resultState.filter(item => item.id !== removeAction.payload.id)
        );
    });
});
