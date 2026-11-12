/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { createStore } from 'redux';
import Composition from '../Composition';
import CompositionUpdate from '../CompositionUpdate';
import CompositionButtons from '../components/CompositionButtonsPanel';
import CompositionButton from '../components/CompositionButton';
import CustomModeler from '../custom-modeler';
import { setElementInputsOutputs } from '../bpmnUtils';
import { SET_COMPOSITION, UPDATE_ERRORS } from '../compositionConstants';

jest.mock('../custom-modeler', () => jest.fn());
jest.mock('bpmn-js-properties-panel', () => ({}));
jest.mock('../custom-properties-provider/provider/camunda', () => ({}));
jest.mock('../bpmnUtils', () => ({ setElementInputsOutputs: jest.fn() }));
jest.mock('react-redux-i18n', () => ({ I18n: { t: key => key } }));

function stateWith(generalState = 'DRAFT', archiving = 'ACTIVE') {
    return {
        workflow: { data: { name: 'Deploy', archiving } },
        activities: [{ name: 'Activate' }],
        currentVersion: {
            composition: {
                diagram: '<diagram/>',
                errors: [{ element: 'task', isValid: false }]
            },
            general: { name: '1.0', state: generalState },
            inputOutput: {
                inputs: [{ name: 'region', type: 'STRING' }],
                outputs: []
            }
        }
    };
}

function connectedProps(Component, state) {
    const store = createStore((current = state) => current);
    const dispatch = jest.spyOn(store, 'dispatch');
    const wrapper = shallow(<Component store={store} />, {
        disableLifecycleMethods: true
    });
    return { props: wrapper.props(), dispatch };
}

test('composition connects workflow, version, normalized I/O and validation state', () => {
    const state = stateWith();
    const { props, dispatch } = connectedProps(Composition, state);
    expect(props).toMatchObject({
        composition: '<diagram/>',
        name: 'Deploy',
        versionName: '1.0',
        activities: [{ name: 'Activate', value: 'Activate' }],
        inputOutput: {
            inputs: [{ name: 'region', type: 'string' }],
            outputs: []
        },
        errors: state.currentVersion.composition.errors,
        isReadOnly: false
    });
    props.compositionUpdate('<changed/>');
    props.validationUpdate('task', true);
    props.showErrorModal('XML is invalid');
    expect(dispatch.mock.calls.map(call => call[0])).toEqual([
        { type: SET_COMPOSITION, payload: '<changed/>' },
        { type: UPDATE_ERRORS, payload: { element: 'task', isValid: true } },
        {
            type: 'modal/SHOW_MODAL',
            payload: {
                size: 'small',
                type: 'error',
                title: 'workflow.composition.bpmnError',
                body: 'XML is invalid',
                withButtons: true,
                closeButtonText: 'buttons.okBtn'
            }
        }
    ]);
});

test('certified versions and archived workflows each make the connected editor readonly', () => {
    expect(
        connectedProps(Composition, stateWith('CERTIFIED')).props.isReadOnly
    ).toBe(true);
    expect(
        connectedProps(Composition, stateWith('DRAFT', 'ARCHIVED')).props
            .isReadOnly
    ).toBe(true);
});

test('readonly button panel blocks clear and upload while download remains available', () => {
    const onClean = jest.fn(),
        onUpload = jest.fn(),
        onDownload = jest.fn();
    const wrapper = mount(
        <CompositionButtons
            isReadOnly
            onClean={onClean}
            onUpload={onUpload}
            onDownload={onDownload}
        />
    );
    const buttons = wrapper.find(CompositionButton);
    expect(buttons.map(button => button.prop('title'))).toEqual([
        'clear',
        'download',
        'upload'
    ]);
    buttons.forEach(button => button.find('.diagram-btn').simulate('click'));
    expect(onClean).not.toHaveBeenCalled();
    expect(onUpload).not.toHaveBeenCalled();
    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.diagram-btn.disabled')).toHaveLength(2);
    wrapper.setProps({ isReadOnly: false });
    wrapper.find('.diagram-btn').forEach(button => button.simulate('click'));
    expect(onClean).toHaveBeenCalledTimes(1);
    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledTimes(2);
    expect(wrapper.find('.divider')).toHaveLength(2);
    wrapper.unmount();
});

function updater() {
    const { props, dispatch } = connectedProps(CompositionUpdate, stateWith());
    const process = { id: 'process' },
        moddle = {};
    const modeler = {
        importXML: jest.fn((xml, callback) => callback(null)),
        saveXML: jest.fn((options, callback) =>
            callback(null, '<normalized/>')
        ),
        get: jest.fn(
            name =>
                name === 'canvas'
                    ? { _rootElement: { businessObject: process } }
                    : moddle
        )
    };
    CustomModeler.mockImplementation(() => modeler);
    const certifyBack = jest.fn(() => {
        expect(dispatch).toHaveBeenCalledWith({
            type: SET_COMPOSITION,
            payload: '<normalized/>'
        });
    });
    const wrapper = shallow(
        <CompositionUpdate.WrappedComponent
            {...props}
            certifyBack={certifyBack}
        />,
        { disableLifecycleMethods: true }
    );
    return {
        wrapper,
        view: wrapper.instance(),
        props,
        dispatch,
        modeler,
        certifyBack,
        process,
        moddle
    };
}

test('certification updater imports workflow I/O then persists XML before invoking certification', () => {
    const {
        view,
        wrapper,
        props,
        dispatch,
        modeler,
        certifyBack,
        process,
        moddle
    } = updater();
    view.componentDidMount();
    expect(CustomModeler).toHaveBeenCalledWith(
        expect.objectContaining({
            workflow: {
                activities: props.activities,
                workflowInputOutput: props.inputOutput
            }
        })
    );
    expect(modeler.importXML).toHaveBeenCalledWith(
        '<diagram/>',
        expect.any(Function)
    );
    expect(setElementInputsOutputs).toHaveBeenCalledWith(
        process,
        props.inputOutput,
        moddle
    );
    expect(dispatch).toHaveBeenCalledWith({
        type: SET_COMPOSITION,
        payload: '<normalized/>'
    });
    expect(certifyBack).toHaveBeenCalledTimes(1);
    expect(wrapper.type()).toBe('div');
});

test('certification updater stops on import error and presents the connected error modal', () => {
    const { view, modeler, dispatch, certifyBack } = updater();
    modeler.importXML.mockImplementation((xml, callback) =>
        callback(new Error('invalid XML'))
    );
    view.componentDidMount();
    expect(modeler.saveXML).not.toHaveBeenCalled();
    expect(certifyBack).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
            type: 'modal/SHOW_MODAL',
            payload: expect.objectContaining({
                type: 'error',
                body: 'workflow.composition.importErrorMsg'
            })
        })
    );
});

test('certification updater stops on serialization failure without certifying or replacing composition', () => {
    const { view, modeler, dispatch, certifyBack } = updater();
    modeler.saveXML.mockImplementation((options, callback) =>
        callback(new Error('cannot save'))
    );
    view.componentDidMount();
    expect(certifyBack).not.toHaveBeenCalled();
    expect(dispatch.mock.calls.map(call => call[0].type)).toEqual([
        'modal/SHOW_MODAL'
    ]);
    expect(dispatch.mock.calls[0][0].payload.body).toBe(
        'workflow.composition.saveErrorMsg'
    );
});
