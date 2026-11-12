/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import General from '../General';
import createTestStore from '../../../../../testSetup/createTestStore';
import { setWorkflowAction } from 'features/workflow/workflowConstants';
import { setWorkflowVersionAction } from 'features/version/versionConstants';

[
    ['draft', 'ACTIVE', false],
    ['certified', 'ACTIVE', true],
    ['draft', 'ARCHIVED', true]
].forEach(([state, status, disabled]) =>
    it(`renders and edits version details in ${state} / ${status} mode`, () => {
        const { store } = createTestStore();
        store.dispatch(setWorkflowAction({ archiving: status }));
        store.dispatch(
            setWorkflowVersionAction({
                id: 'v1',
                state,
                description: 'Version description',
                creationTime: 1000,
                modificationTime: 2000
            })
        );
        const wrapper = mount(
            <Provider store={store}>
                <General />
            </Provider>
        );
        expect(wrapper.find('textarea').prop('value')).toBe(
            'Version description'
        );
        expect(wrapper.find('textarea').prop('disabled')).toBe(disabled);
        expect(wrapper.find('LabeledValue')).toHaveLength(2);
        if (!disabled) {
            wrapper.find('textarea').simulate('change', {
                target: { value: 'Edited description' }
            });
            expect(store.getState().currentVersion.general.description).toBe(
                'Edited description'
            );
            expect(wrapper.find('textarea').prop('value')).toBe(
                'Edited description'
            );
        }
        wrapper.unmount();
    })
);
