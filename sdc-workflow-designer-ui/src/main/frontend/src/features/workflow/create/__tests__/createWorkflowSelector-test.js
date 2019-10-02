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

'use strict';
import {
    getWorkflowName,
    getWorkflowDescription
} from 'features/workflow/workflowSelectors';
import { getWorkflowParams } from 'features/workflow/create/createWorkflowSelector';

describe('New workflow selectors', () => {
    const workflow = {
        data: {
            name: 'workflow1',
            description: 'description'
        }
    };

    it('return workflow name', () => {
        const state = { workflow };
        expect(getWorkflowName(state)).toEqual(workflow.data.name);
    });

    it('return workflow description', () => {
        const state = { workflow };
        expect(getWorkflowDescription(state)).toEqual(
            workflow.data.description
        );
    });

    it('return workflow server params', () => {
        const state = { workflow };
        expect(getWorkflowParams(state)).toEqual({
            name: getWorkflowName(state),
            description: getWorkflowDescription(state)
        });
    });
});
