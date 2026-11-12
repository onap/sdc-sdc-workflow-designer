/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import VersionController from '../VersionController';
import createTestStore from '../../../../../testSetup/createTestStore';
import { setWorkflowAction } from 'features/workflow/workflowConstants';
import {
    setWorkflowVersionAction,
    FETCH_REQUESTED
} from 'features/version/versionConstants';
import { versionListFetchAction } from 'features/workflow/overview/overviewConstansts';
import { setInputsOutputs } from 'features/version/inputOutput/inputOutputActions';
import { SAVE_ACTION, CERTIFY_ACTION } from '../versionControllerConstants';

// BPMN export is exercised separately; expose its completion boundary here.
jest.mock(
    'features/version/composition/CompositionUpdate',
    () =>
        function CompositionUpdate() {
            return null;
        }
);

function setup({
    state = 'draft',
    archiving = 'ACTIVE',
    error = false,
    operationMode = false
} = {}) {
    const context = createTestStore();
    context.store.dispatch(
        setWorkflowAction({ id: 'wf1', name: 'Network', archiving })
    );
    context.store.dispatch(
        setWorkflowVersionAction({
            id: 'v2',
            state,
            description: 'Version notes',
            isCompositionUpdating: false
        })
    );
    context.store.dispatch(
        versionListFetchAction({
            items: [
                { id: 'v1', name: '1', state: 'CERTIFIED' },
                { id: 'v2', name: '2', state: 'DRAFT' }
            ]
        })
    );
    if (error)
        context.store.dispatch(
            setInputsOutputs({
                error: {
                    inputs: {
                        alreadyExists: [0],
                        invalidCharacters: [],
                        emptyName: []
                    },
                    outputs: {}
                }
            })
        );
    context.store.dispatch({
        type: 'pluginContext/SET_CONTEXT',
        payload: { eventsClientId: 'client1', parentUrl: 'http://localhost' }
    });
    const history = { push: jest.fn() };
    const wrapper = mount(
        <Provider store={context.store}>
            <VersionController
                operationMode={operationMode}
                history={history}
                match={{ params: { workflowId: 'wf1' } }}
            />
        </Provider>
    );
    return { ...context, wrapper, history };
}
function clickIcon(wrapper, id) {
    wrapper
        .find('SvgButton')
        .filterWhere(node => node.prop('dataTestId') === id)
        .find('.action-button-wrapper')
        .simulate('click');
}

it('saves the edited version, undoes edits, changes versions, and navigates to the overview', () => {
    const { wrapper, store, actions, history } = setup();
    expect(wrapper.find('.group-name').text()).toBe('Network');
    expect(wrapper.find('option').map(o => o.text())).toEqual([
        '1 CERTIFIED',
        '2 DRAFT'
    ]);
    clickIcon(wrapper, 'vc-save-btn');
    expect(actions.find(a => a.type === SAVE_ACTION).payload).toMatchObject({
        workflowId: 'wf1',
        workflowName: 'Network',
        params: {
            id: 'v2',
            description: 'Version notes',
            inputs: [],
            outputs: []
        }
    });
    clickIcon(wrapper, 'vc-undo-btn');
    expect(actions[actions.length - 1]).toEqual({
        type: FETCH_REQUESTED,
        payload: { workflowId: 'wf1', versionId: 'v2' }
    });
    wrapper.find('select').simulate('change', { target: { value: 'v1' } });
    expect(actions[actions.length - 1]).toEqual({
        type: FETCH_REQUESTED,
        payload: { workflowId: 'wf1', versionId: 'v1' }
    });
    wrapper.find('[data-test-id="vc-versions-page-link"]').simulate('click');
    expect(history.push).toHaveBeenCalledWith(
        '/workflows/workflow/wf1/overview'
    );
    wrapper.find('button.certifyBtn').simulate('click');
    expect(store.getState().currentVersion.general.isCompositionUpdating).toBe(
        true
    );
    expect(actions.some(a => a.type === CERTIFY_ACTION)).toBe(false);
    wrapper.find('CompositionUpdate').prop('certifyBack')();
    expect(store.getState().currentVersion.general.isCompositionUpdating).toBe(
        false
    );
    expect(actions[actions.length - 1]).toMatchObject({
        type: CERTIFY_ACTION,
        payload: {
            workflowId: 'wf1',
            workflowName: 'Network',
            versionId: 'v2',
            params: { description: 'Version notes' }
        }
    });
    wrapper.unmount();
});

[{ state: 'certified' }, { archiving: 'ARCHIVED' }, { error: true }].forEach(
    mode =>
        it(`blocks saves and certification when ${
            Object.keys(mode)[0]
        } makes the version read-only`, () => {
            const { wrapper, actions } = setup(mode);
            const count = actions.length;
            clickIcon(wrapper, 'vc-save-btn');
            clickIcon(wrapper, 'vc-undo-btn');
            expect(wrapper.find('button.certifyBtn').prop('disabled')).toBe(
                true
            );
            expect(actions).toHaveLength(count);
            wrapper.unmount();
        })
);

[false, true].forEach(certified =>
    it(`completes operation-mode versions and reports completion ${certified} to the catalog`, () => {
        const { wrapper, actions } = setup({
            operationMode: true,
            state: certified ? 'certified' : 'draft'
        });
        expect(wrapper.find('select')).toHaveLength(0);
        if (!certified) {
            clickIcon(wrapper, 'vc-save-btn');
            expect(actions.some(a => a.type === SAVE_ACTION)).toBe(true);
            wrapper.find('button.certifyBtn').simulate('click');
            expect(actions[actions.length - 1]).toMatchObject({
                type: CERTIFY_ACTION,
                payload: { workflowId: 'wf1', versionId: 'v2' }
            });
        }
        const postMessage = jest
            .spyOn(window, 'postMessage')
            .mockImplementation(() => {});
        const addListener = jest.spyOn(window, 'addEventListener');
        clickIcon(wrapper, 'vc-back-btn');
        expect(postMessage).toHaveBeenLastCalledWith(
            {
                type: 'CLOSE',
                originId: 'client1',
                data: {
                    isCompleted: certified,
                    workflowId: 'wf1',
                    path: 'workspace.interface_operation'
                }
            },
            'http://localhost'
        );
        addListener.mock.calls
            .filter(args => args[0] === 'message')
            .forEach(args => window.removeEventListener(args[0], args[1]));
        wrapper.unmount();
    })
);
