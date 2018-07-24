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

import Catalog from 'features/catalog/Catalog';
import Version from 'features/version/Version';
import GeneralView from 'features/version/general/General';
import OverviewView from 'features/workflow/overview/Overview';
import InputOutput from 'features/version/inputOutput/InputOutput';
import CompositionView from 'features/version/composition/CompositionView';

export const routes = [
    {
        path: '/workflow/:workflowId/version/:versionId',
        component: Version,
        routes: [
            {
                path: '/',
                exact: true,
                component: GeneralView,
                i18nName: 'workflow.sideBar.general',
                id: 'GENERAL'
            },
            {
                path: '/input-output',
                component: InputOutput,
                i18nName: 'workflow.sideBar.inputOutput',
                id: 'INPUT_OUTPUT'
            },
            {
                path: '/composition',
                component: CompositionView,
                i18nName: 'workflow.sideBar.composition',
                id: 'COMPOSITION'
            }
        ]
    },
    {
        path: '/',
        exact: true,
        component: Catalog
    },
    {
        path: '/workflow/:workflowId/overview',
        component: OverviewView
    }
];
