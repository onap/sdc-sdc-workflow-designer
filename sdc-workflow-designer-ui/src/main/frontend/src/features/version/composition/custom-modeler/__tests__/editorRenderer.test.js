/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import EventBus from 'diagram-js/lib/core/EventBus';
import Styles from 'diagram-js/lib/draw/Styles';
import CustomRenderer from '../custom/CustomRenderer';

function setup() {
    return {
        renderer: new CustomRenderer(new EventBus(), new Styles()),
        parent: document.createElementNS('http://www.w3.org/2000/svg', 'g')
    };
}

test('renders a green triangle and returns a matching absolute shape path', () => {
    const { renderer, parent } = setup();
    const shape = {
        type: 'custom:triangle',
        x: 10,
        y: 20,
        width: 40,
        height: 40
    };
    const polygon = renderer.drawShape(parent, shape);
    expect(polygon.parentNode).toBe(parent);
    expect(polygon.tagName).toBe('polygon');
    expect(polygon.getAttribute('points')).toBe('20,0,40,40,0,40');
    expect(polygon.style.stroke).toBe('#3CAA82');
    expect(polygon.style.fill).toBe('#3CAA82');
    expect(polygon.style.strokeWidth).toBe('2px');
    expect(renderer.getShapePath(shape)).toBe('M30,20l20,40l-40,0z');
});

test('renders a centered white circle with blue border and a closed path', () => {
    const { renderer, parent } = setup();
    const shape = {
        type: 'custom:circle',
        x: 10,
        y: 20,
        width: 140,
        height: 140
    };
    const circle = renderer.drawShape(parent, shape);
    expect(circle.parentNode).toBe(parent);
    expect(circle.tagName).toBe('circle');
    expect(circle.getAttribute('cx')).toBe('70');
    expect(circle.getAttribute('cy')).toBe('70');
    expect(circle.getAttribute('r')).toBe('70');
    expect(circle.style.stroke).toBe('#4488aa');
    expect(circle.style.strokeWidth).toBe('4px');
    expect(circle.style.fill).toBe('white');
    expect(renderer.getShapePath(shape)).toBe(
        'M80,90m0,-70a70,70,0,1,1,0,140a70,70,0,1,1,0,-140z'
    );
});

test('renders custom polylines and uses original docking positions when calculating their paths', () => {
    const { renderer, parent } = setup();
    const connection = {
        type: 'custom:connection',
        waypoints: [
            { x: 10, y: 20, original: { x: 1, y: 2 } },
            { x: 30, y: 40 },
            { x: 50, y: 60 }
        ]
    };
    renderer.drawConnection(parent, connection);
    const line = parent.lastChild;
    expect(line.parentNode).toBe(parent);
    expect(line.tagName).toBe('polyline');
    expect(line.getAttribute('points')).toBe('10,20 30,40 50,60 ');
    expect(line.style.stroke).toBe('#ff471a');
    expect(line.style.strokeWidth).toBe('2px');
    expect(renderer.getConnectionPath(connection)).toBe('M1,2L30,40L50,60');
});

test('advertises custom elements and leaves unsupported shapes and connections for other renderers', () => {
    const { renderer, parent } = setup();
    expect(renderer.canRender({ type: 'custom:circle' })).toBe(true);
    expect(renderer.canRender({ type: 'bpmn:Task' })).toBe(false);
    expect(
        renderer.drawShape(parent, { type: 'custom:unknown' })
    ).toBeUndefined();
    expect(renderer.getShapePath({ type: 'custom:unknown' })).toBeUndefined();
    expect(
        renderer.drawConnection(parent, { type: 'bpmn:SequenceFlow' })
    ).toBeUndefined();
    expect(
        renderer.getConnectionPath({ type: 'bpmn:SequenceFlow' })
    ).toBeUndefined();
    expect(parent.childNodes).toHaveLength(0);
});

test('registers with the rendering event bus and does not intercept standard BPMN render events', () => {
    const eventBus = new EventBus();
    const renderer = new CustomRenderer(eventBus, new Styles());
    const parent = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const shape = {
        type: 'custom:triangle',
        x: 0,
        y: 0,
        width: 40,
        height: 40
    };
    expect(
        eventBus.fire('render.shape', { gfx: parent, element: shape }).tagName
    ).toBe('polygon');
    expect(
        eventBus.fire('render.shape', {
            gfx: parent,
            element: { type: 'bpmn:Task' }
        })
    ).toBeUndefined();
    expect(eventBus.fire('render.getShapePath', shape)).toBe(
        renderer.getShapePath(shape)
    );
});
