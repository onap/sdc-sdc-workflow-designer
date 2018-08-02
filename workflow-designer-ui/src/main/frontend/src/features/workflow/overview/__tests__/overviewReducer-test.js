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

import overviewReducer from '../overviewReducer';
import { versionListFetchAction } from '../overviewConstansts';

describe('Overview reducer', () => {
    it('check fetch versions', () => {
        const versionResponse = {
            total: 2,
            size: 0,
            page: 0,
            items: [
                {
                    id: '99adf5bc36764628b8018033d285b591',
                    name: '1.0',
                    description: 'Initial versionewewe',
                    baseId: '',
                    state: 'CERTIFIED',
                    inputs: [
                        {
                            id: '08274a71d7e34d4e96878aa5fb1ed9bd',
                            name: 'wewe',
                            type: 'INTEGER',
                            mandatory: true
                        },
                        {
                            id: '7a0b9e33ea0244c2a05c03b96207f1c8',
                            name: 'eee',
                            type: 'BOOLEAN',
                            mandatory: false
                        }
                    ],
                    outputs: [
                        {
                            id: 'a5314bbd67ff4e6091385aaa82ebb266',
                            name: 'e',
                            type: 'FLOAT',
                            mandatory: false
                        }
                    ],
                    creationTime: '2018-07-25T07:36:10.112+0000',
                    modificationTime: '2018-07-25T07:36:48.663+0000'
                },
                {
                    id: 'cd8156bfb250475dac1e2681a9f2a74f',
                    name: '2.0',
                    description: 'versio2neee',
                    baseId: '99adf5bc36764628b8018033d285b591',
                    state: 'CERTIFIED',
                    inputs: [
                        {
                            id: '08274a71d7e34d4e96878aa5fb1ed9bd',
                            name: 'wewe',
                            type: 'INTEGER',
                            mandatory: true
                        },
                        {
                            id: '7a0b9e33ea0244c2a05c03b96207f1c8',
                            name: 'eee',
                            type: 'BOOLEAN',
                            mandatory: false
                        }
                    ],
                    outputs: [
                        {
                            id: 'a5314bbd67ff4e6091385aaa82ebb266',
                            name: 'e',
                            type: 'FLOAT',
                            mandatory: false
                        }
                    ],
                    creationTime: '2018-07-25T07:36:58.978+0000',
                    modificationTime: '2018-07-25T07:37:09.041+0000'
                }
            ]
        };

        expect(
            overviewReducer([], versionListFetchAction(versionResponse))
        ).toEqual([...versionResponse.items]);
    });
});
