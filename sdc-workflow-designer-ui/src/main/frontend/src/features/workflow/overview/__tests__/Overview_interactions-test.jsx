/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import Overview from '../Overview';
import createTestStore from '../../../../../testSetup/createTestStore';
import { setWorkflowAction } from 'features/workflow/workflowConstants';
import { setWorkflowVersionAction } from 'features/version/versionConstants';
import {
    versionListFetchAction,
    GET_OVERVIEW,
    UPDATE_WORKFLOW,
    ARCHIVE_WORKFLOW,
    RESTORE_WORKFLOW
} from '../overviewConstansts';

// The shared graph renderer needs SVG layout APIs absent from jsdom.
jest.mock('shared/tree/Tree', () => () => null);

function setup(status = 'ACTIVE') {
    const context = createTestStore();
    context.store.dispatch(
        setWorkflowAction({
            id: 'wf1',
            name: 'Network',
            description: 'Original',
            archiving: status
        })
    );
    context.store.dispatch(
        setWorkflowVersionAction({ id: 'v2', state: 'draft' })
    );
    context.store.dispatch(
        versionListFetchAction({
            items: [
                {
                    id: 'v1',
                    name: '1',
                    state: 'certified',
                    description: 'First',
                    modificationTime: 1000
                },
                {
                    id: 'v2',
                    name: '2',
                    baseId: 'v1',
                    state: 'certified',
                    description: 'Second',
                    modificationTime: 2000
                }
            ]
        })
    );
    const history = { push: jest.fn() };
    const wrapper = mount(
        <Provider store={context.store}>
            <Overview
                match={{ params: { workflowId: 'wf1' } }}
                history={history}
            />
        </Provider>
    );
    return { ...context, wrapper, history };
}

it('loads the workflow, selects versions and saves description changes without corrupting the payload', () => {
    const { wrapper, actions, history, store } = setup();
    expect(actions).toContainEqual({ type: GET_OVERVIEW, payload: 'wf1' });
    wrapper
        .find('.version-list-items .version-item-row')
        .first()
        .simulate('click');
    expect(history.push).toHaveBeenCalledWith('version/v1');
    expect(wrapper.find('.version-list-items .selected').text()).toContain(
        'Second'
    );
    wrapper
        .find('textarea')
        .simulate('change', { target: { value: 'Updated' } });
    expect(store.getState().workflow.data.description).toBe('Updated');
    wrapper.find('form').simulate('submit', { preventDefault: jest.fn() });
    expect(actions.find(a => a.type === UPDATE_WORKFLOW).payload).toEqual({
        id: 'wf1',
        name: 'Network',
        description: 'Updated',
        created: undefined,
        modified: undefined
    });
    wrapper.find('.create-item-plus-icon').simulate('click');
    expect(store.getState().modal.customComponentName).toBe(
        'NEW_VERSION_MODAL'
    );
    wrapper.find('SVGIcon.go-catalog-btn').prop('onClick')();
    expect(history.push).toHaveBeenCalledWith('/workflows/');
    wrapper.unmount();
});

it('requires confirmation before archiving and clears the alert on confirmation', () => {
    const { wrapper, store, actions, history } = setup();
    wrapper.find('SVGIcon.archive-btn').prop('onClick')();
    expect(actions.some(a => a.type === ARCHIVE_WORKFLOW)).toBe(false);
    expect(store.getState().modal).toMatchObject({
        type: 'alert',
        withButtons: true
    });
    store.getState().modal.actionButtonClick();
    expect(actions).toContainEqual({
        type: ARCHIVE_WORKFLOW,
        payload: { id: 'wf1', name: 'Network', history, type: 'ARCHIVED' }
    });
    expect(store.getState().modal).toEqual({});
    wrapper.unmount();
});

it('disables description editing and version creation for archived workflows and allows restoration', () => {
    const { wrapper, actions, history } = setup('ARCHIVED');
    expect(wrapper.find('textarea').prop('disabled')).toBe(true);
    expect(wrapper.find('.save-description button').prop('disabled')).toBe(
        true
    );
    expect(
        wrapper.find('.create-new-version').hasClass('newVersionDisabled')
    ).toBe(true);
    wrapper.find('button.restore-btn').simulate('click');
    expect(actions).toContainEqual({
        type: RESTORE_WORKFLOW,
        payload: { id: 'wf1', history, type: 'ACTIVE' }
    });
    wrapper.unmount();
});
