/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import BpmnModdle from 'bpmn-moddle';
import camunda from '../custom-properties-provider/descriptors/camunda.json';
import { setElementInputsOutputs, updatedData } from '../bpmnUtils';

describe('BPMN input/output synchronization', () => {
    let moddle;
    let task;

    beforeEach(() => {
        moddle = new BpmnModdle({ camunda });
        task = moddle.create('bpmn:ServiceTask', { id: 'Task_1' });
    });

    it('keeps user values by name while replacing stale parameter definitions', () => {
        const existing = [
            moddle.create('camunda:InputParameter', {
                name: 'retained',
                value: 'user value'
            }),
            moddle.create('camunda:InputParameter', {
                name: 'removed',
                value: 'old'
            })
        ];
        const definitions = [
            { name: 'retained', value: 'spec default' },
            { name: 'added', value: 'new default' }
        ];
        const result = updatedData(
            moddle,
            definitions,
            existing,
            'camunda:InputParameter',
            task
        );

        expect(
            result.map(parameter => ({
                name: parameter.name,
                value: parameter.value
            }))
        ).toEqual([
            { name: 'retained', value: 'user value' },
            { name: 'added', value: 'new default' }
        ]);
        expect(
            result.every(parameter =>
                parameter.$instanceOf('camunda:InputParameter')
            )
        ).toBe(true);
        expect(result.every(parameter => parameter.$parent === task)).toBe(
            true
        );
        expect(result[0]).not.toBe(existing[0]);
        expect(definitions[0].value).toBe('spec default');
    });

    it('creates extension data for a new task and defaults missing directions to empty lists', () => {
        setElementInputsOutputs(
            task,
            { inputs: [{ name: 'source', value: 'default' }] },
            moddle
        );

        expect(
            task.extensionElements.$instanceOf('bpmn:ExtensionElements')
        ).toBe(true);
        const io = task.extensionElements.values[0];
        expect(io.$instanceOf('camunda:InputOutput')).toBe(true);
        expect(io.inputParameters[0].name).toBe('source');
        expect(io.inputParameters[0].value).toBe('default');
        expect(io.outputParameters).toEqual([]);

        setElementInputsOutputs(task, {}, moddle);
        expect(task.extensionElements.values).toHaveLength(1);
        expect(task.extensionElements.values[0].inputParameters).toEqual([]);
        expect(task.extensionElements.values[0].outputParameters).toEqual([]);
    });

    it('replaces only InputOutput extensions and preserves edited values in both directions', () => {
        const listener = moddle.create('camunda:ExecutionListener', {
            event: 'start'
        });
        task.extensionElements = moddle.create('bpmn:ExtensionElements', {
            values: [listener]
        });
        setElementInputsOutputs(
            task,
            {
                inputs: [{ name: 'in', value: 'initial' }],
                outputs: [{ name: 'out', value: 'initial' }]
            },
            moddle
        );
        const previous = task.extensionElements.values[1];
        previous.inputParameters[0].value = 'edited input';
        previous.outputParameters[0].value = 'edited output';

        setElementInputsOutputs(
            task,
            {
                inputs: [
                    { name: 'in', value: 'replacement' },
                    { name: 'new', value: 'default' }
                ],
                outputs: [{ name: 'out', value: 'replacement' }]
            },
            moddle
        );

        expect(task.extensionElements.values).toHaveLength(2);
        expect(task.extensionElements.values[0]).toBe(listener);
        const io = task.extensionElements.values[1];
        expect(io).not.toBe(previous);
        expect(io.inputParameters.map(parameter => parameter.value)).toEqual([
            'edited input',
            'default'
        ]);
        expect(io.outputParameters[0].value).toBe('edited output');
    });

    it('resets edited values when an activity change requests clean parameters', () => {
        task.extensionElements = moddle.create('bpmn:ExtensionElements');
        setElementInputsOutputs(
            task,
            {
                inputs: [{ name: 'in', value: 'old input' }],
                outputs: [{ name: 'out', value: 'old output' }]
            },
            moddle
        );
        setElementInputsOutputs(
            task,
            {
                inputs: [{ name: 'in', value: 'new input' }],
                outputs: [{ name: 'out', value: 'new output' }]
            },
            moddle,
            true
        );

        const io = task.extensionElements.values[0];
        expect(io.inputParameters[0].value).toBe('new input');
        expect(io.outputParameters[0].value).toBe('new output');
    });
});
