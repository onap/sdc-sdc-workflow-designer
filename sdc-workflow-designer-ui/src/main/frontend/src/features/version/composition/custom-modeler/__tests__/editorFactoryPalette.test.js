/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import EventBus from 'diagram-js/lib/core/EventBus';
import BpmnModdle from 'bpmn-moddle';
import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory';
import Ids from 'ids';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import CustomElementFactory from '../custom/CustomElementFactory';
import CustomPalette from '../custom/CustomPalette';
import CustomContextPadProvider from '../custom/CustomContextPadProvider';

function elementFactory() {
    const moddle = new BpmnModdle();
    moddle.ids = new Ids([32, 36, 1]);
    return new CustomElementFactory(new BpmnFactory(moddle), moddle);
}

test('creates custom shapes with semantic identity, default sizes and working ModelUtil type checks', () => {
    const factory = elementFactory();
    const triangle = factory.createShape({
        type: 'custom:triangle',
        id: 'triangle',
        x: 10,
        y: 20
    });
    expect(triangle).toMatchObject({
        id: 'triangle',
        type: 'custom:triangle',
        width: 40,
        height: 40,
        x: 10,
        y: 20
    });
    expect(triangle.businessObject).toEqual({
        type: 'custom:triangle',
        id: 'triangle'
    });
    expect(is(triangle, 'custom:triangle')).toBe(true);
    expect(is(triangle, 'custom:circle')).toBe(false);
    expect(Object.keys(triangle.businessObject)).not.toContain('$instanceOf');
    const circle = factory.createShape({ type: 'custom:circle' });
    expect(circle).toMatchObject({ width: 140, height: 140 });
    expect(circle.businessObject.id).toBeUndefined();
    const unknown = factory.createShape({ type: 'custom:unknown' });
    expect(unknown).toMatchObject({ width: 100, height: 80 });
});

test('preserves existing custom semantics and connections while delegating standard BPMN and label creation', () => {
    const factory = elementFactory();
    const instanceOf = jest.fn(() => true);
    const businessObject = { id: 'connection', $instanceOf: instanceOf };
    const connection = factory.createConnection({
        type: 'custom:connection',
        businessObject,
        waypoints: [{ x: 1, y: 2 }]
    });
    expect(connection.businessObject).toBe(businessObject);
    expect(connection.businessObject.$instanceOf).toBe(instanceOf);
    expect(connection.width).toBeUndefined();
    expect(connection.waypoints).toEqual([{ x: 1, y: 2 }]);
    const task = factory.createShape({ type: 'bpmn:ServiceTask' });
    expect(task.businessObject.$type).toBe('bpmn:ServiceTask');
    expect(task.businessObject.di.bpmnElement).toBe(task.businessObject);
    expect(task).toMatchObject({ width: 100, height: 80 });
    const label = factory.createLabel({
        id: 'label',
        businessObject: task.businessObject,
        width: 120
    });
    expect(label).toMatchObject({
        id: 'label',
        type: 'label',
        width: 120,
        height: 20
    });
    expect(label.businessObject).toBe(task.businessObject);
});

test('palette registers tools and creates real BPMN shapes from both click and drag actions', () => {
    const palette = { registerProvider: jest.fn() };
    const create = { start: jest.fn() };
    const factory = elementFactory();
    const space = { activateSelection: jest.fn() },
        lasso = { activateSelection: jest.fn() },
        hand = { activateHand: jest.fn() },
        connect = { toggle: jest.fn() };
    const provider = new CustomPalette(
        palette,
        create,
        factory,
        space,
        lasso,
        hand,
        connect,
        text => 'translated:' + text
    );
    expect(palette.registerProvider).toHaveBeenCalledWith(provider);
    const entries = provider.getPaletteEntries();
    const event = { type: 'mousedown' };
    entries['hand-tool'].action.click(event);
    entries['lasso-tool'].action.click(event);
    entries['space-tool'].action.click(event);
    entries['global-connect-tool'].action.click(event);
    [
        hand.activateHand,
        lasso.activateSelection,
        space.activateSelection,
        connect.toggle
    ].forEach(action => expect(action).toHaveBeenCalledWith(event));
    expect(entries['tool-separator'].separator).toBe(true);
    expect(entries['create.task'].title).toBe('Create Task');
    expect(entries['create.exclusive-gateway'].title).toBe(
        'translated:Create Gateway'
    );
    const types = {
        'create.start-event': 'bpmn:StartEvent',
        'create.intermediate-event': 'bpmn:IntermediateThrowEvent',
        'create.end-event': 'bpmn:EndEvent',
        'create.exclusive-gateway': 'bpmn:ExclusiveGateway',
        'create.task': 'bpmn:Task',
        'create.subprocess-expanded': 'bpmn:SubProcess'
    };
    Object.keys(types).forEach(key => {
        ['click', 'dragstart'].forEach(action => {
            entries[key].action[action](event);
            const [receivedEvent, shape] = create.start.mock.calls[
                create.start.mock.calls.length - 1
            ];
            expect(receivedEvent).toBe(event);
            expect(shape.businessObject.$type).toBe(types[key]);
            if (key === 'create.subprocess-expanded') {
                expect(shape.businessObject.di.isExpanded).toBe(true);
                expect(shape).toMatchObject({ width: 350, height: 200 });
            }
        });
    });
});

test('context pad preserves base deletion and supplies custom click and drag connection actions only for supported custom shapes', () => {
    const factory = elementFactory();
    const eventBus = new EventBus();
    const contextPad = { registerProvider: jest.fn() };
    const modeling = { removeElements: jest.fn() };
    const connect = { start: jest.fn() };
    const translate = text => 'translated:' + text;
    // Invoke the real BPMN provider with headless UI services. No SVG or popup
    // renderer is needed to verify the custom provider's merged action table.
    const injector = {
        invoke(Base, owner) {
            Base.call(
                owner,
                { autoPlace: false },
                injector,
                eventBus,
                contextPad,
                modeling,
                factory,
                connect,
                {},
                { isEmpty: () => true },
                {},
                { allowed: () => true },
                translate
            );
        }
    };
    const provider = new CustomContextPadProvider(injector, connect, translate);
    expect(contextPad.registerProvider).toHaveBeenCalledWith(provider);
    ['custom:triangle', 'custom:circle'].forEach(type => {
        const element = factory.createShape({ type });
        const entries = provider.getContextPadEntries(element);
        expect(entries.connect).toMatchObject({
            group: 'connect',
            title: 'translated:Connect using custom connection'
        });
        const event = { type: 'click' };
        entries.connect.action.click(event, element, true);
        entries.connect.action.dragstart(event, element, false);
        expect(connect.start).toHaveBeenCalledWith(event, element, true);
        expect(connect.start).toHaveBeenCalledWith(event, element, false);
        entries.delete.action.click(event);
        expect(modeling.removeElements).toHaveBeenCalledWith([element]);
    });
    const unsupported = provider.getContextPadEntries(
        factory.createShape({ type: 'custom:unknown' })
    );
    expect(unsupported.connect).toBeUndefined();
    expect(unsupported.delete).toBeDefined();
    const standard = provider.getContextPadEntries(
        factory.createShape({ type: 'bpmn:StartEvent' })
    );
    expect(standard.connect.title).toBe(
        'translated:Connect using Sequence/MessageFlow or Association'
    );
});
