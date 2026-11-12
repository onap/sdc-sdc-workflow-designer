/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import EventBus from 'diagram-js/lib/core/EventBus';
import CommandStack from 'diagram-js/lib/command/CommandStack';
import Rules from 'diagram-js/lib/features/rules/Rules';
import BpmnModdle from 'bpmn-moddle';
import CustomRules from '../custom/CustomRules';
import CustomUpdater from '../custom/CustomUpdater';

function ruleEngine() {
    const eventBus = new EventBus();
    const stack = new CommandStack(eventBus, {});
    const rules = new Rules({ get: () => stack });
    [
        'shape.create',
        'shape.resize',
        'elements.move',
        'connection.create',
        'connection.reconnectStart',
        'connection.reconnectEnd'
    ].forEach(action => {
        stack.register(action, { canExecute: () => true });
    });
    new CustomRules(eventBus);
    const moddle = new BpmnModdle();
    const bpmn = type => ({ type, businessObject: moddle.create(type) });
    return { rules, bpmn };
}

test('custom shapes can be created only on process, participant or collaboration containers', () => {
    const { rules, bpmn } = ruleEngine();
    const shape = { type: 'custom:triangle' };
    ['bpmn:Process', 'bpmn:Participant', 'bpmn:Collaboration'].forEach(type => {
        expect(
            rules.allowed('shape.create', { shape, target: bpmn(type) })
        ).toBe(true);
    });
    ['bpmn:Task', 'bpmn:SubProcess'].forEach(type => {
        expect(
            rules.allowed('shape.create', { shape, target: bpmn(type) })
        ).toBe(false);
    });
    expect(rules.allowed('shape.create', { shape, target: null })).toBeNull();
    expect(
        rules.allowed('shape.create', {
            shape: bpmn('bpmn:Task'),
            target: bpmn('bpmn:SubProcess')
        })
    ).toBe(true);
    expect(rules.allowed('shape.resize', { shape })).toBe(false);
    expect(rules.allowed('shape.resize', { shape: bpmn('bpmn:Task') })).toBe(
        true
    );
});

test('moving mixed custom and BPMN selections is rejected in either order, while homogeneous selections use container rules', () => {
    const { rules, bpmn } = ruleEngine();
    const custom = { type: 'custom:triangle' },
        other = { type: 'custom:circle' };
    const task = bpmn('bpmn:Task'),
        target = bpmn('bpmn:Process');
    [[custom, task], [task, custom], [custom, task, other]].forEach(shapes => {
        expect(rules.allowed('elements.move', { shapes, target })).toBe(false);
    });
    expect(
        rules.allowed('elements.move', { shapes: [custom, other], target })
    ).toBe(true);
    expect(rules.allowed('elements.move', { shapes: [task], target })).toBe(
        true
    );
    expect(rules.allowed('elements.move', { shapes: [], target })).toBe(true);
    expect(
        rules.allowed('elements.move', {
            shapes: [custom, other],
            target: task
        })
    ).toBe(false);
});

test('connections require a custom shape and a BPMN task in either direction, including task subtypes', () => {
    const { rules, bpmn } = ruleEngine();
    const custom = { type: 'custom:triangle' },
        task = bpmn('bpmn:ServiceTask'),
        event = bpmn('bpmn:StartEvent');
    [[custom, task], [task, custom]].forEach(([source, target]) => {
        expect(rules.allowed('connection.create', { source, target })).toEqual({
            type: 'custom:connection'
        });
    });
    [
        [custom, event],
        [event, custom],
        [custom, custom],
        [custom, null],
        [null, custom]
    ].forEach(([source, target]) => {
        expect(rules.allowed('connection.create', { source, target })).toBe(
            false
        );
    });
    expect(
        rules.allowed('connection.create', { source: event, target: task })
    ).toBe(true);
});

test('reconnecting either endpoint checks the hovered candidate before the previous endpoint', () => {
    const { rules, bpmn } = ruleEngine();
    const custom = { type: 'custom:triangle' },
        task = bpmn('bpmn:Task'),
        event = bpmn('bpmn:EndEvent');
    expect(
        rules.allowed('connection.reconnectStart', {
            connection: { target: custom },
            source: task
        })
    ).toEqual({ type: 'custom:connection' });
    expect(
        rules.allowed('connection.reconnectStart', {
            connection: { target: custom },
            source: event,
            hover: task
        })
    ).toEqual({ type: 'custom:connection' });
    expect(
        rules.allowed('connection.reconnectStart', {
            connection: { target: custom },
            source: task,
            hover: event
        })
    ).toBe(false);
    expect(
        rules.allowed('connection.reconnectEnd', {
            connection: { source: custom },
            target: task
        })
    ).toEqual({ type: 'custom:connection' });
    expect(
        rules.allowed('connection.reconnectEnd', {
            connection: { source: custom },
            target: event,
            hover: task
        })
    ).toEqual({ type: 'custom:connection' });
    expect(
        rules.allowed('connection.reconnectEnd', {
            connection: { source: custom },
            target: task,
            hover: event
        })
    ).toBe(false);
});

function updateEngine() {
    const eventBus = new EventBus();
    const stack = new CommandStack(eventBus, {});
    const bpmnjs = { _customElements: [] };
    new CustomUpdater(eventBus, bpmnjs);
    return { eventBus, stack, bpmnjs };
}

test('custom shape creation, movement, deletion and undo keep semantic position and membership synchronized', () => {
    const { stack, bpmnjs } = updateEngine();
    const parent = { id: 'process' };
    const businessObject = { id: 'triangle' };
    const shape = { type: 'custom:triangle', businessObject, x: 0, y: 0 };
    stack.register('shape.create', {
        execute() {
            shape.parent = parent;
            shape.x = 20;
            shape.y = 40;
            return shape;
        },
        revert() {
            shape.parent = null;
            return shape;
        }
    });
    stack.register('shape.move', {
        execute() {
            shape.x = 30;
            shape.y = 50;
            return shape;
        },
        revert() {
            shape.x = 20;
            shape.y = 40;
            return shape;
        }
    });
    stack.register('shape.delete', {
        execute() {
            shape.parent = null;
            return shape;
        },
        revert() {
            shape.parent = parent;
            return shape;
        }
    });
    stack.execute('shape.create', { shape });
    expect(bpmnjs._customElements).toEqual([businessObject]);
    expect(businessObject).toMatchObject({ x: 20, y: 40 });
    stack.execute('shape.move', { shape });
    expect(bpmnjs._customElements).toEqual([businessObject]);
    expect(businessObject).toMatchObject({ x: 30, y: 50 });
    stack.undo();
    expect(businessObject).toMatchObject({ x: 20, y: 40 });
    stack.execute('shape.delete', { shape });
    expect(bpmnjs._customElements).toEqual([]);
    stack.undo();
    expect(bpmnjs._customElements).toEqual([businessObject]);
    stack.undo();
    expect(bpmnjs._customElements).toEqual([]);
    stack.redo();
    expect(bpmnjs._customElements).toEqual([businessObject]);
});

test('connection updates copy waypoints and persist endpoint ids without duplicating membership', () => {
    const { eventBus, bpmnjs } = updateEngine();
    const businessObject = {};
    const connection = {
        type: 'custom:connection',
        businessObject,
        parent: {},
        source: { id: 'triangle' },
        target: { id: 'task' },
        waypoints: [
            { x: 2, y: 3, original: { x: 10, y: 11 } },
            { x: 20, y: 30 }
        ]
    };
    const commands = [
        'connection.create',
        'connection.reconnectStart',
        'connection.reconnectEnd',
        'connection.updateWaypoints',
        'connection.delete',
        'connection.layout',
        'connection.move'
    ];
    commands.forEach(command => {
        eventBus.fire('commandStack.' + command + '.executed', {
            context: { connection }
        });
        eventBus.fire('commandStack.' + command + '.reverted', {
            context: { connection }
        });
    });
    expect(bpmnjs._customElements).toEqual([businessObject]);
    expect(businessObject).toMatchObject({
        source: 'triangle',
        target: 'task',
        waypoints: [{ x: 2, y: 3 }, { x: 20, y: 30 }]
    });
    expect(businessObject.waypoints).not.toBe(connection.waypoints);
    expect(businessObject.waypoints[0]).not.toBe(connection.waypoints[0]);
    connection.waypoints[0].x = 99;
    expect(businessObject.waypoints[0].x).toBe(2);
    connection.source = null;
    connection.parent = null;
    eventBus.fire('commandStack.connection.delete.executed', {
        context: { connection }
    });
    expect(bpmnjs._customElements).toEqual([]);
    expect(businessObject.source).toBe('triangle');
    connection.source = { id: 'circle' };
    connection.target = null;
    eventBus.fire('commandStack.connection.delete.reverted', {
        context: { connection }
    });
    expect(businessObject.source).toBe('triangle');
});

test('BPMN elements and empty command contexts are ignored by custom synchronization', () => {
    const { eventBus, bpmnjs } = updateEngine();
    const businessObject = {};
    eventBus.fire('commandStack.shape.create.executed', {
        context: {
            shape: { type: 'bpmn:Task', businessObject, parent: {}, x: 9, y: 8 }
        }
    });
    eventBus.fire('commandStack.connection.create.executed', {
        context: { connection: { type: 'bpmn:SequenceFlow', businessObject } }
    });
    eventBus.fire('commandStack.shape.move.executed', { context: {} });
    expect(bpmnjs._customElements).toEqual([]);
    expect(businessObject).toEqual({});
});
