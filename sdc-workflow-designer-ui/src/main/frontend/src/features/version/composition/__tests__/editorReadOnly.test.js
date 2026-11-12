/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import EventBus from 'diagram-js/lib/core/EventBus';
import ReadOnly from '../readOnly';

const editorCommands = [
    'undo',
    'redo',
    'copy',
    'paste',
    'removeSelection',
    'spaceTool',
    'lassoTool',
    'globalConnectTool',
    'distributeElements',
    'alignElements',
    'directEditing'
];
const modelingCommands = [
    'moveShape',
    'updateAttachment',
    'moveElements',
    'moveConnection',
    'layoutConnection',
    'createConnection',
    'createShape',
    'createLabel',
    'appendShape',
    'removeElements',
    'distributeElements',
    'removeShape',
    'removeConnection',
    'replaceShape',
    'pasteElements',
    'alignElements',
    'resizeShape',
    'createSpace',
    'updateWaypoints',
    'reconnectStart',
    'reconnectEnd'
];

function setup() {
    const eventBus = new EventBus();
    const state = { history: [] };
    function operation(name) {
        return function(...args) {
            state.history.push({ name, args, owner: this });
            return name;
        };
    }
    const contextPad = { open: operation('open'), close: jest.fn() };
    const dragging = { init: operation('drag'), cancel: jest.fn() };
    const directEditing = { activate: operation('edit'), cancel: jest.fn() };
    const editorActions = {
        _actions: editorCommands.reduce(
            (all, key) => ({ ...all, [key]: operation(key) }),
            {}
        )
    };
    const modeling = modelingCommands.reduce(
        (all, key) => ({ ...all, [key]: operation(key) }),
        {}
    );
    const palette = { _update: jest.fn() };
    const paletteProvider = {
        getPaletteEntries: () => ({
            create: { title: 'Create task' },
            tools: { title: 'Move' }
        })
    };
    const readOnly = new ReadOnly(
        eventBus,
        contextPad,
        dragging,
        directEditing,
        editorActions,
        modeling,
        palette,
        paletteProvider
    );
    return {
        readOnly,
        eventBus,
        contextPad,
        dragging,
        directEditing,
        editorActions,
        modeling,
        palette,
        paletteProvider,
        state
    };
}

test('readonly transition closes active interactions and updates the palette before normal event listeners', () => {
    const {
        readOnly,
        eventBus,
        contextPad,
        dragging,
        directEditing,
        palette,
        paletteProvider
    } = setup();
    const observed = [];
    eventBus.on('readOnly.changed', event =>
        observed.push({
            value: event.readOnly,
            entries: paletteProvider.getPaletteEntries()
        })
    );
    expect(readOnly.readOnly()).toBe(false);
    expect(Object.keys(paletteProvider.getPaletteEntries())).toEqual([
        'create',
        'tools'
    ]);
    expect(readOnly.readOnly('locked')).toBe(true);
    expect(contextPad.close).toHaveBeenCalledTimes(1);
    expect(dragging.cancel).toHaveBeenCalledTimes(1);
    expect(directEditing.cancel).toHaveBeenCalledTimes(1);
    expect(palette._update).toHaveBeenCalledTimes(1);
    expect(observed).toEqual([{ value: true, entries: {} }]);
    expect(readOnly.readOnly(true)).toBe(true);
    expect(readOnly.readOnly()).toBe(true);
    expect(palette._update).toHaveBeenCalledTimes(1);
    expect(readOnly.readOnly(0)).toBe(false);
    expect(palette._update).toHaveBeenCalledTimes(2);
    expect(contextPad.close).toHaveBeenCalledTimes(1);
    expect(observed[1]).toEqual({
        value: false,
        entries: { create: { title: 'Create task' }, tools: { title: 'Move' } }
    });
});

test('suppresses user interaction and editor actions while locked, and preserves arguments, return values and receiver after unlocking', () => {
    const {
        readOnly,
        contextPad,
        dragging,
        directEditing,
        editorActions,
        state
    } = setup();
    const operations = [
        [contextPad, 'open'],
        [dragging, 'init'],
        [directEditing, 'activate'],
        ...editorCommands.map(name => [editorActions._actions, name])
    ];
    readOnly.readOnly(true);
    operations.forEach(([owner, name]) =>
        expect(owner[name]('selection', 3)).toBeUndefined()
    );
    expect(state.history).toEqual([]);
    readOnly.readOnly(false);
    operations.forEach(([owner, name], index) => {
        expect(owner[name]('selection', index)).toEqual(expect.any(String));
        expect(state.history[index]).toMatchObject({
            args: ['selection', index]
        });
        expect(state.history[index].owner).toBe(owner);
    });
});

test('rejects all modeling mutations in readonly mode and restores mutations when unlocked', () => {
    const { readOnly, modeling, state } = setup();
    readOnly.readOnly(true);
    modelingCommands.forEach(name =>
        expect(() => modeling[name]({ id: 'task' })).toThrow(
            'model is read-only'
        )
    );
    expect(state.history).toEqual([]);
    readOnly.readOnly(false);
    modelingCommands.forEach((name, index) => {
        expect(modeling[name]({ id: 'task' }, index)).toBe(name);
        expect(state.history[index]).toEqual({
            name,
            args: [{ id: 'task' }, index],
            owner: modeling
        });
    });
});

test('responds to externally fired readonly changes as well as the public setter', () => {
    const { eventBus, readOnly, contextPad, paletteProvider } = setup();
    eventBus.fire('readOnly.changed', { readOnly: true });
    expect(readOnly.readOnly()).toBe(true);
    expect(contextPad.open()).toBeUndefined();
    expect(paletteProvider.getPaletteEntries()).toEqual({});
    eventBus.fire('readOnly.changed', { readOnly: false });
    expect(contextPad.open()).toBe('open');
});
