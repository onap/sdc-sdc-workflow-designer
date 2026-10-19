/*
* Copyright © 2026 Deutsche Telekom AG
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

import { runSaga } from 'redux-saga';
import versionApi from 'features/version/versionApi';
import {
    watchUpdateVersion,
    watchCertifyVersion
} from 'features/version/versionSaga';
import { actionTypes } from 'shared/notifications/notificationsConstants';
import { NETWORK_GENERIC_ERROR } from 'wfapp/appConstants';

jest.mock('features/version/versionApi', () => ({
    updateVersion: jest.fn(),
    updateVersionArtifact: jest.fn(),
    deleteVersionArtifact: jest.fn(),
    certifyVersion: jest.fn()
}));
jest.mock('features/workflow/overview/overviewApi', () => ({}));
jest.mock('react-redux-i18n', () => ({ I18n: { t: key => key } }));

const diagram = (
    planeContent,
    planeId = 'BPMNPlane_1'
) => `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="d">
  <bpmn2:process id="Process_1" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="${planeId}" bpmnElement="Process_1">${planeContent}</bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

const SHAPE =
    '<bpmndi:BPMNShape id="Shape_1" bpmnElement="Start_1"><dc:Bounds x="0" y="0" width="36" height="36" /></bpmndi:BPMNShape>';
const EMPTY_DIAGRAM = diagram('');
const DIAGRAM_WITH_SHAPE = diagram(SHAPE);
const IMPORTED_DIAGRAM_WITH_SHAPE = diagram(SHAPE, 'Plane_imported');

const actionFor = composition => ({
    payload: {
        workflowId: 'wf-1',
        workflowName: 'test workflow',
        versionId: 'v-1',
        params: { id: 'v-1', name: '1.0', description: '', composition }
    }
});

const run = (saga, action) => {
    const dispatched = [];
    return runSaga(
        { dispatch: a => dispatched.push(a) },
        saga,
        action
    ).done.then(() => dispatched);
};

const notifications = dispatched =>
    dispatched
        .filter(a => a.type === actionTypes.ADD_NOTIFICATION)
        .map(({ payload: { type, title, message } }) => ({
            type,
            title,
            message
        }));

describe('Version saga', () => {
    beforeEach(() => jest.resetAllMocks());

    it('refuses to certify an empty composition without saving anything', async () => {
        const dispatched = await run(
            watchCertifyVersion,
            actionFor(EMPTY_DIAGRAM)
        );

        expect(notifications(dispatched)).toEqual([
            {
                type: 'error',
                title: 'workflow.confirmationMessages.certifyTitle',
                message: 'workflow.composition.certifyEmptyComposition'
            }
        ]);
        expect(versionApi.updateVersion).not.toHaveBeenCalled();
        expect(versionApi.deleteVersionArtifact).not.toHaveBeenCalled();
        expect(versionApi.certifyVersion).not.toHaveBeenCalled();
    });

    it('certifies a composition whose plane is not BPMNPlane_1 with a single notification', async () => {
        const dispatched = await run(
            watchCertifyVersion,
            actionFor(IMPORTED_DIAGRAM_WITH_SHAPE)
        );

        expect(versionApi.updateVersion).toHaveBeenCalled();
        expect(versionApi.updateVersionArtifact).toHaveBeenCalledWith(
            expect.objectContaining({
                versionName: '1_0',
                payload: IMPORTED_DIAGRAM_WITH_SHAPE
            })
        );
        expect(versionApi.certifyVersion).toHaveBeenCalled();
        expect(notifications(dispatched)).toEqual([
            {
                type: 'success',
                title: 'workflow.confirmationMessages.certifyTitle',
                message: 'workflow.confirmationMessages.certifyMessage'
            }
        ]);
    });

    it('leaves a failed certify request to the error modal instead of adding a notification', async () => {
        versionApi.certifyVersion.mockImplementation(() =>
            Promise.reject({ responseJSON: { message: 'boom' } })
        );

        const dispatched = await run(
            watchCertifyVersion,
            actionFor(DIAGRAM_WITH_SHAPE)
        );

        expect(notifications(dispatched)).toEqual([]);
        expect(dispatched.map(a => a.type)).toContain(NETWORK_GENERIC_ERROR);
    });

    it('saves an empty composition by deleting the artifact and then reports success', async () => {
        const dispatched = await run(
            watchUpdateVersion,
            actionFor(EMPTY_DIAGRAM)
        );

        expect(versionApi.deleteVersionArtifact).toHaveBeenCalledWith({
            workflowId: 'wf-1',
            versionId: 'v-1'
        });
        expect(versionApi.updateVersionArtifact).not.toHaveBeenCalled();
        expect(notifications(dispatched)).toEqual([
            {
                type: 'success',
                title: 'workflow.confirmationMessages.updateTitle',
                message: 'workflow.confirmationMessages.updateMessage'
            }
        ]);
    });

    it('does not report a save as successful when the artifact upload fails', async () => {
        versionApi.updateVersionArtifact.mockImplementation(() =>
            Promise.reject({ responseJSON: {} })
        );

        const dispatched = await run(
            watchUpdateVersion,
            actionFor(DIAGRAM_WITH_SHAPE)
        );

        expect(notifications(dispatched)).toEqual([]);
    });
});
