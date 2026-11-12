/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { shallow } from 'enzyme';
import fileSaver from 'file-saver';
import CompositionView from '../CompositionView';
import CustomModeler from '../custom-modeler';
import { setElementInputsOutputs } from '../bpmnUtils';
import newDiagram from '../newDiagram.bpmn';
import {
    PROCESS_DEFAULT_ID,
    COMPOSITION_ERROR_COLOR,
    COMPOSITION_VALID_COLOR,
    CAMUNDA_PANEL_INPUTS_NAMES
} from '../compositionConstants';

// SVG layout and BPMN import are the browser integration boundary. The view's
// callbacks still operate on the same process, canvas and modeler throughout.
jest.mock('../custom-modeler', () => jest.fn());
jest.mock('bpmn-js-properties-panel', () => ({}));
jest.mock('../custom-properties-provider/provider/camunda', () => ({}));
jest.mock('../bpmnUtils', () => ({ setElementInputsOutputs: jest.fn() }));
jest.mock('file-saver', () => ({ saveAs: jest.fn() }));
jest.mock('react-redux-i18n', () => ({ I18n: { t: key => key } }));

function makeEditor(overrides = {}) {
    const process = { id: PROCESS_DEFAULT_ID };
    const canvas = {
        zoom: jest.fn(),
        _rootElement: { businessObject: process }
    };
    const modeling = { setColor: jest.fn() };
    const readOnly = { readOnly: jest.fn() };
    const moddle = {};
    const modeler = {
        attachTo: jest.fn(),
        importXML: jest.fn((xml, callback) => callback(null)),
        saveXML: jest.fn((options, callback) => callback(null, '<saved/>')),
        on: jest.fn(),
        get: jest.fn(name => ({ canvas, modeling, readOnly, moddle }[name]))
    };
    CustomModeler.mockImplementation(() => modeler);
    const props = {
        composition: '<initial/>',
        compositionUpdate: jest.fn(),
        showErrorModal: jest.fn(),
        name: 'Deploy Service',
        versionName: '1.0',
        activities: [
            { name: 'Activate', inputs: ['region'], outputs: ['status'] }
        ],
        inputOutput: { inputs: [], outputs: [] },
        validationUpdate: jest.fn(),
        errors: [],
        isReadOnly: false,
        ...overrides
    };
    const wrapper = shallow(<CompositionView {...props} />, {
        disableLifecycleMethods: true
    });
    const view = wrapper.instance();
    view.componentDidMount();
    return {
        wrapper,
        view,
        props,
        modeler,
        process,
        canvas,
        modeling,
        readOnly,
        moddle
    };
}

function propertiesPanel() {
    document.body.innerHTML = `<div id="js-properties-panel">
        <input name="value"/><input name="selectedExtensionElement"/>
        <button></button><select></select>
        <div id="${CAMUNDA_PANEL_INPUTS_NAMES[0]}"></div>
    </div>`;
}

afterEach(() => {
    document.body.innerHTML = '';
});

test('initializes the modeler, imports and normalizes the process, and wires editor events', () => {
    const {
        view,
        props,
        modeler,
        process,
        canvas,
        moddle,
        readOnly
    } = makeEditor();
    expect(CustomModeler).toHaveBeenCalledWith(
        expect.objectContaining({
            workflow: {
                activities: props.activities,
                workflowInputOutput: props.inputOutput,
                validationUpdate: props.validationUpdate,
                getActivityInputsOutputs: view.getActivityInputsOutputs
            },
            propertiesPanel: { parent: '#js-properties-panel' },
            additionalModules: expect.any(Array),
            moddleExtensions: { camunda: expect.any(Object) }
        })
    );
    expect(modeler.attachTo).toHaveBeenCalledWith('#' + view.generatedId);
    expect(modeler.importXML).toHaveBeenCalledWith(
        '<initial/>',
        expect.any(Function)
    );
    expect(canvas.zoom).toHaveBeenCalledWith('fit-viewport');
    expect(process).toMatchObject({
        id: 'deploy_service',
        name: 'Deploy Service'
    });
    expect(setElementInputsOutputs).toHaveBeenCalledWith(
        process,
        props.inputOutput,
        moddle
    );
    expect(readOnly.readOnly).toHaveBeenCalledWith(false);
    const handlers = modeler.on.mock.calls.reduce(
        (result, [event, callback]) => ({ ...result, [event]: callback }),
        {}
    );
    handlers['element.out']();
    expect(props.compositionUpdate).toHaveBeenCalledWith('<saved/>');
    expect(handlers['element.click']).toBe(view.handleCompositionStatus);
    expect(handlers['propertiesPanel.changed']).toBe(
        view.handleCompositionStatus
    );
});

test('uses current activities and leaves explicit process identifiers and names intact', () => {
    const { view, wrapper } = makeEditor();
    expect(view.getActivityInputsOutputs('Activate')).toEqual({
        inputs: ['region'],
        outputs: ['status']
    });
    expect(view.getActivityInputsOutputs('missing')).toEqual({
        inputs: [],
        outputs: []
    });
    wrapper.setProps({
        activities: [{ name: 'New', inputs: [1], outputs: [2] }]
    });
    expect(view.getActivityInputsOutputs('Activate')).toEqual({
        inputs: [],
        outputs: []
    });
    expect(view.getActivityInputsOutputs('New')).toEqual({
        inputs: [1],
        outputs: [2]
    });
    const process = { id: 'explicit', name: 'Existing' };
    view.setDefaultIdAndName(process);
    expect(process).toEqual({ id: 'explicit', name: 'Existing' });
    wrapper.setProps({ name: undefined });
    const unnamed = {};
    view.setDefaultIdAndName(unnamed);
    expect(unnamed).toEqual({ id: '', name: '' });
});

test('updates validation colors only for changed errors and imports a composition only after a version change', () => {
    const { wrapper, view, props, modeler, modeling } = makeEditor();
    const errors = [
        { element: { id: 'bad' }, isValid: false },
        { element: { id: 'good' }, isValid: true }
    ];
    wrapper.setProps({ errors });
    view.componentDidUpdate(props);
    expect(modeling.setColor.mock.calls).toEqual([
        [[errors[0].element], { fill: COMPOSITION_ERROR_COLOR }],
        [[errors[1].element], { fill: COMPOSITION_VALID_COLOR }]
    ]);
    const currentProps = view.props;
    view.componentDidUpdate({
        ...currentProps,
        errors: errors.map(item => ({ ...item }))
    });
    expect(modeling.setColor).toHaveBeenCalledTimes(2);
    modeler.importXML.mockClear();
    wrapper.setProps({ composition: '<edited/>' });
    view.componentDidUpdate(currentProps);
    expect(modeler.importXML).not.toHaveBeenCalled();
    const edited = view.props;
    wrapper.setProps({ versionName: '2.0' });
    view.componentDidUpdate(edited);
    expect(view.versionChanged).toBe(true);
    expect(modeler.importXML).not.toHaveBeenCalled();
    const nextVersion = view.props;
    wrapper.setProps({ composition: '<version-two/>' });
    view.componentDidUpdate(nextVersion);
    expect(modeler.importXML).toHaveBeenCalledWith(
        '<version-two/>',
        expect.any(Function)
    );
    expect(view.versionChanged).toBe(false);
    const current = view.props;
    wrapper.setProps({ versionName: '3.0', composition: '<version-three/>' });
    view.componentDidUpdate(current);
    expect(modeler.importXML).toHaveBeenLastCalledWith(
        '<version-three/>',
        expect.any(Function)
    );
});

test('locks and unlocks the modeler and panel fields while retaining extension selection', () => {
    propertiesPanel();
    const { wrapper, view, props, readOnly } = makeEditor();
    wrapper.setProps({ isReadOnly: true });
    view.componentDidUpdate(props);
    const panel = document.getElementById('js-properties-panel');
    ['input[name="value"]', 'button', 'select'].forEach(selector => {
        expect(panel.querySelector(selector).disabled).toBe(true);
        expect(panel.querySelector(selector).readOnly).toBe(true);
    });
    expect(
        panel.querySelector('[name="selectedExtensionElement"]').disabled
    ).toBe(false);
    expect(
        document
            .getElementById(CAMUNDA_PANEL_INPUTS_NAMES[0])
            .getAttribute('editable-readonly')
    ).toBe('false');
    expect(readOnly.readOnly).toHaveBeenLastCalledWith(true);
    const locked = view.props;
    wrapper.setProps({ isReadOnly: false });
    view.componentDidUpdate(locked);
    expect(panel.querySelector('input').disabled).toBe(false);
    expect(
        document
            .getElementById(CAMUNDA_PANEL_INPUTS_NAMES[0])
            .getAttribute('editable-readonly')
    ).toBe('true');
    panel.querySelector('input').disabled = true;
    view.handleCompositionStatus();
    expect(panel.querySelector('input').disabled).toBe(false);
});

test('reports an import failure without changing the process or workflow parameters', () => {
    const { view, modeler, props, canvas } = makeEditor();
    modeler.importXML.mockImplementation((xml, callback) =>
        callback(new Error('malformed XML'))
    );
    canvas.zoom.mockClear();
    setElementInputsOutputs.mockClear();
    view.setDiagramToBPMN('broken');
    expect(props.showErrorModal).toHaveBeenCalledWith(
        'workflow.composition.importErrorMsg'
    );
    expect(canvas.zoom).not.toHaveBeenCalled();
    expect(setElementInputsOutputs).not.toHaveBeenCalled();
});

test('saves XML to Redux and downloads a named UTF-8 BPMN file', () => {
    const { view, modeler, props } = makeEditor();
    view.exportDiagramToStore();
    expect(modeler.saveXML).toHaveBeenCalledWith(
        { format: true },
        expect.any(Function)
    );
    expect(props.compositionUpdate).toHaveBeenCalledWith('<saved/>');
    view.exportDiagram();
    expect(fileSaver.saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'deployservice-1.0.bpmn'
    );
    expect(fileSaver.saveAs.mock.calls[0][0].type).toBe(
        'text/html;charset=utf-8'
    );
    expect(fileSaver.saveAs.mock.calls[0][0].size).toBe('<saved/>'.length);
});

test('surfaces save and download failures without dispatching or creating a file', () => {
    const { view, modeler, props } = makeEditor();
    modeler.saveXML.mockImplementation((options, callback) =>
        callback(new Error('serialization failed'))
    );
    view.exportDiagramToStore();
    view.exportDiagram();
    expect(props.showErrorModal.mock.calls).toEqual([
        ['workflow.composition.saveErrorMsg'],
        ['workflow.composition.exportErrorMsg']
    ]);
    expect(props.compositionUpdate).not.toHaveBeenCalled();
    expect(fileSaver.saveAs).not.toHaveBeenCalled();
});

test('routes clear, upload and file selection controls to the modeler', () => {
    const { wrapper, view, modeler } = makeEditor();
    const buttons = wrapper.find('CompositionButtons');
    expect(buttons.prop('isReadOnly')).toBe(false);
    buttons.prop('onClean')();
    expect(modeler.importXML).toHaveBeenLastCalledWith(
        newDiagram,
        expect.any(Function)
    );
    const click = jest.fn();
    view.fileInput.current = { click, value: 'workflow.bpmn' };
    buttons.prop('onUpload')();
    expect(click).toHaveBeenCalledTimes(1);
    const readAsText = jest.fn(function() {
        this.onloadend({ target: { result: '<uploaded/>' } });
    });
    jest.spyOn(window, 'FileReader').mockImplementation(() => ({ readAsText }));
    const file = new File(['<uploaded/>'], 'workflow.bpmn');
    wrapper
        .find('input[type="file"]')
        .simulate('change', { target: { files: [file] } });
    expect(readAsText).toHaveBeenCalledWith(file);
    expect(modeler.importXML).toHaveBeenLastCalledWith(
        '<uploaded/>',
        expect.any(Function)
    );
    expect(view.fileInput.current.value).toBe('');
    expect(wrapper.find('.bpmn-container').prop('id')).toBe(view.generatedId);
});
