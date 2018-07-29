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
import React from 'react';
import renderer from 'react-test-renderer';

import VersionControllerView from 'features/version/versionController/VersionControllerView';

describe('Version Controller View Snapshot', () => {
    it('renders correctly', () => {
        const versionList = [
            {
                id: '7b5f6b086613470985082df2c0f6c713',
                name: '1.0',
                description:
                    'Initial version, bug fix for previous version that fixed an exception when the port was occupied',
                status: 'Draft',
                creationTime: 1530687330460,
                modificationTime: 1530687330575,
                archivedStatus: 'ACTIVE'
            },
            {
                id: '7b5f6b086613470985082df2c0f6c666',
                name: '2.0',
                description:
                    'Test version, bug fix for previous version that fixed an exception when the port was occupied',
                status: 'Draft',
                creationTime: 1530687330461,
                modificationTime: 1530687330576,
                archivedStatus: 'ACTIVE',
                baseId: '7b5f6b086613470985082df2c0f6c713'
            }
        ];
        const tree = renderer
            .create(
                <VersionControllerView
                    viewableVersions={versionList}
                    currentWorkflowVersion={versionList[0]}
                />
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
});
