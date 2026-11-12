/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import BpmnModdle from 'bpmn-moddle';
import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory';
import Ids from 'ids';
import Modeler from 'bpmn-js/lib/Modeler';
import CustomModeler from '..';
import CustomElementFactory from '../custom/CustomElementFactory';
import CustomModule from '../custom';

// The base Modeler constructor starts the full browser canvas/SVG layout stack.
// Keep that boundary headless while using actual diagram-js element creation.
jest.mock('bpmn-js/lib/Modeler', () => {
    const Base = jest.fn(function(options) {
        this.options = options;
    });
    Base.prototype._modules = ['base-module'];
    return Base;
});

function modeler() {
    const moddle = new BpmnModdle();
    moddle.ids = new Ids([32, 36, 1]);
    const elementFactory = new CustomElementFactory(
        new BpmnFactory(moddle),
        moddle
    );
    const parent = { id: 'process' };
    const registry = {};
    const canvas = {
        addShape: jest.fn(shape => {
            shape.parent = parent;
            registry[shape.id] = shape;
            return shape;
        }),
        addConnection: jest.fn(connection => {
            connection.parent = parent;
            registry[connection.id] = connection;
            return connection;
        })
    };
    const instance = new CustomModeler({ container: '#diagram' });
    instance.get = name =>
        ({
            canvas,
            elementFactory,
            elementRegistry: { get: id => registry[id] }
        }[name]);
    return { instance, canvas, registry, parent };
}

test('extends the base modeler and registers all custom services without changing the base module list', () => {
    const { instance } = modeler();
    expect(Modeler).toHaveBeenCalledWith({ container: '#diagram' });
    expect(instance).toBeInstanceOf(Modeler);
    expect(instance._modules).toEqual(['base-module', CustomModule]);
    expect(Modeler.prototype._modules).toEqual(['base-module']);
    expect(CustomModule.__init__).toEqual(
        expect.arrayContaining([
            'customRenderer',
            'paletteProvider',
            'customRules',
            'customUpdater',
            'contextPadProvider'
        ])
    );
    expect(CustomModule.elementFactory).toEqual(['type', CustomElementFactory]);
    expect(instance.getCustomElements()).toEqual([]);
});

test('adds shapes before connections even when input is unordered and connects actual factory elements', () => {
    const { instance, canvas, registry, parent } = modeler();
    const triangle = { id: 'triangle', type: 'custom:triangle', x: 10, y: 20 };
    const circle = { id: 'circle', type: 'custom:circle', x: 100, y: 200 };
    const connection = {
        id: 'connection',
        type: 'custom:connection',
        source: 'triangle',
        target: 'circle',
        waypoints: [{ x: 10, y: 20 }, { x: 100, y: 200 }]
    };
    instance.addCustomElements([connection, triangle, circle]);
    expect(canvas.addShape).toHaveBeenCalledTimes(2);
    expect(canvas.addConnection).toHaveBeenCalledTimes(1);
    expect(registry.connection.source).toBe(registry.triangle);
    expect(registry.connection.target).toBe(registry.circle);
    expect(registry.connection.parent).toBe(parent);
    expect(registry.triangle.businessObject).toBe(triangle);
    expect(registry.circle.businessObject).toBe(circle);
    expect(registry.connection.businessObject).toBe(connection);
    expect(registry.triangle).toMatchObject({
        width: 40,
        height: 40,
        x: 10,
        y: 20
    });
    expect(registry.circle).toMatchObject({ width: 140, height: 140 });
    expect(instance.getCustomElements()).toEqual([
        triangle,
        circle,
        connection
    ]);
});

test('rejects invalid element collections without touching the diagram, and isolates modeler state', () => {
    const { instance, canvas } = modeler();
    [undefined, null, {}, 'shape'].forEach(value =>
        expect(() => instance.addCustomElements(value)).toThrow(
            'argument must be an array'
        )
    );
    instance.addCustomElements([]);
    expect(canvas.addShape).not.toHaveBeenCalled();
    expect(canvas.addConnection).not.toHaveBeenCalled();
    instance.addCustomElements([{ id: 'one', type: 'custom:triangle' }]);
    const other = modeler().instance;
    expect(other.getCustomElements()).toEqual([]);
    expect(instance.getCustomElements()).toHaveLength(1);
});
