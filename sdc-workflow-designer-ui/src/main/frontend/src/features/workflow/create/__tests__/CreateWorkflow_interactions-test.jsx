/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import CreateWorkflow from '../CreateWorkflow';
import createTestStore from '../../../../../testSetup/createTestStore';
import { setWorkflowAction } from 'features/workflow/workflowConstants';
import {
    putValidationError,
    SUBMIT_WORKFLOW
} from '../createWorkflowConstants';
import { showCustomModalAction } from 'shared/modal/modalWrapperActions';

it('clears stale creation data, updates controlled fields, submits workflow data, and closes the dialog', () => {
    const { store, actions } = createTestStore();
    store.dispatch(
        setWorkflowAction({
            name: 'Stale',
            description: 'Old',
            error: 'Old error'
        })
    );
    const wrapper = mount(
        <Provider store={store}>
            <MemoryRouter>
                <CreateWorkflow />
            </MemoryRouter>
        </Provider>
    );
    expect(wrapper.find('input').prop('value')).toBe('');
    expect(store.getState().workflow.data).toEqual({});
    wrapper
        .find('input')
        .simulate('change', { target: { value: 'Network deployment' } });
    wrapper
        .find('textarea')
        .simulate('change', { target: { value: 'Deploy a new network' } });
    wrapper.update();
    expect(store.getState().workflow.data).toMatchObject({
        name: 'Network deployment',
        description: 'Deploy a new network'
    });
    expect(wrapper.find('textarea').prop('value')).toBe('Deploy a new network');
    store.dispatch(putValidationError('Name already exists'));
    wrapper.update();
    expect(wrapper.text()).toContain('Name already exists');
    const preventDefault = jest.fn();
    wrapper.find('form').simulate('submit', { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
    expect(actions.find(a => a.type === SUBMIT_WORKFLOW).payload).toMatchObject(
        {
            name: 'Network deployment',
            description: 'Deploy a new network',
            history: expect.any(Object)
        }
    );
    store.dispatch(showCustomModalAction({ title: 'New Workflow' }));
    wrapper
        .find('button')
        .last()
        .simulate('click');
    expect(store.getState().modal).toEqual({});
    wrapper.unmount();
});
