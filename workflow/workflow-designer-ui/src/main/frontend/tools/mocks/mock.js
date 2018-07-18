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

const proxy = {
    'POST /workflows': {
        id: '755eab7752374a2380544065b59b082d',
        name: 'Workflow one',
        description: 'description description 1'
    },
    'POST /workflows/:id/versions': {
        baseId: null,
        creationTime: '2018-07-11T14:30:42.954Z',
        description: 'description',
        id: '7b5f6b086613470985082df2c0f6c713',
        modificationTime: "2018-07-11T14:30:42.954Z",
        name: 'version 1',
        status: 'Certified'
    },
    'GET /workflow-api/v1.0/wf/workflows': {
        total: 2,
        limit: 100,
        offset: 0,
        results: [
            {
                id: '755eab7752374a2380544065b59b082d',
                name: 'Workflow one',
                description: 'description description 1',
                category: null
            },
            {
                id: 'ef8159204dac4c10a85b29ec30b4bd56',
                name: 'Workflow two',
                description: 'description description 2',
                category: null
            }
        ]
    },
    'GET /api/workflow/category': [
        {
            name: 'Network Connectivity',
            normalizedName: 'network connectivity',
            uniqueId: 'resourceNewCategory.network connectivity',
            icons: null,
            subcategories: [
                {
                    name: 'Virtual Links',
                    normalizedName: 'virtual links',
                    uniqueId:
                        'resourceNewCategory.network connectivity.virtual links',
                    icons: ['vl'],
                    groupings: null,
                    version: null,
                    ownerId: null,
                    empty: false,
                    type: null
                },
                {
                    name: 'Connection Points',
                    normalizedName: 'connection points',
                    uniqueId:
                        'resourceNewCategory.network connectivity.connection points',
                    icons: ['cp'],
                    groupings: null,
                    version: null,
                    ownerId: null,
                    empty: false,
                    type: null
                }
            ],
            version: null,
            ownerId: null,
            empty: false,
            type: null
        },
        {
            name: 'Generic',
            normalizedName: 'generic',
            uniqueId: 'resourceNewCategory.generic',
            icons: null,
            subcategories: [
                {
                    name: 'Infrastructure',
                    normalizedName: 'infrastructure',
                    uniqueId: 'resourceNewCategory.generic.infrastructure',
                    icons: ['connector'],
                    groupings: null,
                    version: null,
                    ownerId: null,
                    empty: false,
                    type: null
                },
                {
                    name: 'Network Elements',
                    normalizedName: 'network elements',
                    uniqueId: 'resourceNewCategory.generic.network elements',
                    icons: ['network', 'connector'],
                    groupings: null,
                    version: null,
                    ownerId: null,
                    empty: false,
                    type: null
                },
                {
                    name: 'Database',
                    normalizedName: 'database',
                    uniqueId: 'resourceNewCategory.generic.database',
                    icons: ['database'],
                    groupings: null,
                    version: null,
                    ownerId: null,
                    empty: false,
                    type: null
                },
                {
                    name: 'Abstract',
                    normalizedName: 'abstract',
                    uniqueId: 'resourceNewCategory.generic.abstract',
                    icons: ['objectStorage', 'compute'],
                    groupings: null,
                    version: null,
                    ownerId: null,
                    empty: false,
                    type: null
                },
                {
                    name: 'Rules',
                    normalizedName: 'rules',
                    uniqueId: 'resourceNewCategory.generic.rules',
                    icons: ['networkrules', 'securityrules'],
                    groupings: null,
                    version: null,
                    ownerId: null,
                    empty: false,
                    type: null
                }
            ],
            version: null,
            ownerId: null,
            empty: false,
            type: null
        }
    ],
    'GET /workflow-api/workflows/:id/versions/:versionId': {
        id: '7b5f6b086613470985082df2c0f6c713',
        major: 0,
        minor: 0,
        name: '1.0',
        description: 'Initial version, bug fix for previous version that fixed an exception when the port was occupied',
        baseId: null,
        creationTime: '2018-07-04T08:24:50.777+0000',
        modificationTime: '2018-07-04T11:06:29.559+0000',
        status: 'Draft',
        state: {
            synchronizationState: 'UpToDate',
            dirty: false
        },
        additionalInfo: null,
        final: false
    },
    'GET /workflow-api/workflows/:id': {
        id: '755eab7752374a2380544065b59b082d',
        name: 'Workflow1',
        description: 'workflow description',
        creationTime: '2018-07-04T08:24:50.777+0000'
    },
    'GET /api/workflow/:id/getVersions': {
        listCount: 2,
        versionList: [
            {
                id: '7b5f6b086613470985082df2c0f6c713',
                baseId: null,
                name: '1.0',
                description: 'Initial version, bug fix for previous version that fixed an exception when the port was occupied',
                status: 'Certified',
                creationTime: "2018-07-11T09:08:46.892Z",
                modificationTime: "2018-07-11T09:08:46.892Z",
                archivedStatus: 'ACTIVE'
            },
            {
                id: '7b5f6b086613470985082df2c0f6c666',
                baseId: '7b5f6b086613470985082df2c0f6c713',
                name: '2.0',
                description: 'Test version, bug fix for previous version that fixed an exception when the port was occupied',
                status: 'Certified',
                creationTime: "2018-07-09T09:08:46.892Z",
                modificationTime: "2018-07-09T09:08:46.892Z",
                archivedStatus: 'ACTIVE'
            }
        ]
    }
};

module.exports = proxy;
