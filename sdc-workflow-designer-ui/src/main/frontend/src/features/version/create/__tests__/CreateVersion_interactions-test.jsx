/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import CreateVersion from '../CreateVersion';
import createTestStore from '../../../../../testSetup/createTestStore';
import { setWorkflowAction } from 'features/workflow/workflowConstants';
import { versionListFetchAction } from 'features/workflow/overview/overviewConstansts';
import { SUBMIT_VERSION } from '../createVersionConstants';
import { showCustomModalAction } from 'shared/modal/modalWrapperActions';

[['v1'], []].forEach(ids =>
    it(`submits the description with base ${ids[0] ||
        'none'} without browser navigation`, () => {
        const { store, actions } = createTestStore();
        store.dispatch(setWorkflowAction({ id: 'wf1' }));
        store.dispatch(
            versionListFetchAction({
                items: ids.filter(Boolean).map(id => ({ id, name: '1' }))
            })
        );
        store.dispatch(showCustomModalAction({ title: 'New Version' }));
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter>
                    <CreateVersion />
                </MemoryRouter>
            </Provider>
        );
        expect(wrapper.find('select').prop('disabled')).toBe(true);
        wrapper
            .find('textarea')
            .simulate('change', { target: { value: 'Next release' } });
        expect(wrapper.find('textarea').prop('value')).toBe('Next release');
        const preventDefault = jest.fn();
        wrapper.find('form').simulate('submit', { preventDefault });
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(
            actions.find(a => a.type === SUBMIT_VERSION).payload
        ).toMatchObject({
            description: 'Next release',
            workflowId: 'wf1',
            baseId: ids[0] || null,
            history: expect.any(Object)
        });
        expect(store.getState().modal).toEqual({});
        store.dispatch(showCustomModalAction({ title: 'New Version' }));
        wrapper
            .find('button')
            .last()
            .simulate('click');
        expect(store.getState().modal).toEqual({});
        wrapper.unmount();
    })
);
