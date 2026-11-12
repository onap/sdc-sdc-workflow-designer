/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import InputOutput from '../InputOutput';
import InputOutputView from '../InputOutputView';
import DataRow from '../views/DataRow';
import { setInputsOutputs } from '../inputOutputActions';
import { setWorkflowAction } from 'features/workflow/workflowConstants';
import { setWorkflowVersionAction } from 'features/version/versionConstants';
import createTestStore from '../../../../../testSetup/createTestStore';

function setup(archiving = 'ACTIVE', state = 'draft') {
    const context = createTestStore();
    context.store.dispatch(setWorkflowAction({ archiving }));
    context.store.dispatch(setWorkflowVersionAction({ id: 'v1', state }));
    context.store.dispatch(
        setInputsOutputs({
            inputs: [{ name: 'network', type: 'STRING', mandatory: false }],
            outputs: []
        })
    );
    const wrapper = mount(
        <Provider store={context.store}>
            <InputOutput />
        </Provider>
    );
    return { ...context, wrapper };
}

it('edits input name, type and mandatory flag, validates duplicates, and deletes only after confirmation', () => {
    const { wrapper, store } = setup();
    wrapper
        .find('.input-output__tr input[type="text"]')
        .simulate('change', { target: { value: 'networkId' } });
    wrapper.find('select').simulate('change', { target: { value: 'INTEGER' } });
    wrapper.find('Checkbox').prop('onChange')(true);
    wrapper.update();
    expect(store.getState().currentVersion.inputOutput.inputs).toEqual([
        { name: 'networkId', type: 'INTEGER', mandatory: true }
    ]);
    wrapper.find('[data-test-id="wf-input-output-add"]').simulate('click');
    wrapper
        .find('.input-output__tr input[type="text"]')
        .last()
        .simulate('change', { target: { value: 'networkId' } });
    expect(
        store.getState().currentVersion.inputOutput.error.inputs.alreadyExists
    ).toEqual([0, 1]);
    expect(
        wrapper
            .find(DataRow)
            .first()
            .prop('nameErrorMessage')
    ).toBeTruthy();
    wrapper
        .find(DataRow)
        .first()
        .prop('handleRemoveClick')();
    expect(store.getState().currentVersion.inputOutput.inputs).toHaveLength(2);
    expect(store.getState().modal).toMatchObject({
        type: 'alert',
        withButtons: true
    });
    store.getState().modal.actionButtonClick();
    wrapper.update();
    expect(store.getState().modal).toEqual({});
    expect(store.getState().currentVersion.inputOutput.inputs).toHaveLength(1);
    wrapper.unmount();
});

it('switches input/output tabs without redundant dispatches and deletes blank rows immediately', () => {
    const { wrapper, store, actions } = setup();
    const before = actions.length;
    wrapper
        .find('[data-test-id="wf-input-output-inputs-tab"]')
        .simulate('click');
    expect(actions).toHaveLength(before);
    wrapper
        .find('[data-test-id="wf-input-output-outputs-tab"]')
        .simulate('click');
    expect(wrapper.find('.input-output__td--empty')).toHaveLength(1);
    const count = actions.length;
    wrapper
        .find('[data-test-id="wf-input-output-outputs-tab"]')
        .simulate('click');
    expect(actions).toHaveLength(count);
    wrapper.find('[data-test-id="wf-input-output-add"]').simulate('click');
    expect(store.getState().currentVersion.inputOutput.outputs).toHaveLength(1);
    wrapper.find(DataRow).prop('handleRemoveClick')();
    expect(store.getState().currentVersion.inputOutput.outputs).toHaveLength(0);
    expect(store.getState().modal).toEqual({});
    wrapper
        .find('[data-test-id="wf-input-output-inputs-tab"]')
        .simulate('click');
    wrapper.find('ExpandableInput').prop('onChange')('missing');
    wrapper.update();
    expect(wrapper.find('.input-output__td--empty')).toHaveLength(1);
    wrapper.find('ExpandableInput').prop('onChange')('NETWORK');
    wrapper.update();
    expect(wrapper.find(DataRow)).toHaveLength(1);
    wrapper.unmount();
});

[['ARCHIVED', 'draft'], ['ACTIVE', 'certified']].forEach(([archiving, state]) =>
    it(`renders read-only controls for ${archiving} / ${state}`, () => {
        const { wrapper } = setup(archiving, state);
        expect(wrapper.find('.input-output__add').hasClass('disabled')).toBe(
            true
        );
        expect(
            wrapper.find('.input-output__table__tbody').hasClass('disabled')
        ).toBe(true);
        wrapper.unmount();
    })
);

it('prioritizes invalid characters, duplicate and empty-name errors on their respective rows', () => {
    const rows = ['bad!', 'duplicate', ''].map(name => ({
        name,
        type: 'STRING',
        mandatory: false
    }));
    const wrapper = shallow(
        <InputOutputView
            dataRows={rows}
            types={['string']}
            error={{
                invalidCharacters: [0],
                alreadyExists: [1],
                emptyName: [2]
            }}
        />
    );
    expect(
        wrapper.find(DataRow).map(row => row.prop('nameErrorMessage'))
    ).toEqual([expect.any(String), expect.any(String), expect.any(String)]);
    expect(
        wrapper
            .find(DataRow)
            .at(0)
            .prop('nameErrorMessage')
    ).not.toBe(
        wrapper
            .find(DataRow)
            .at(1)
            .prop('nameErrorMessage')
    );
    expect(
        wrapper
            .find(DataRow)
            .at(1)
            .prop('nameErrorMessage')
    ).not.toBe(
        wrapper
            .find(DataRow)
            .at(2)
            .prop('nameErrorMessage')
    );
});
