/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import BpmnModdle from 'bpmn-moddle';
import EventBus from 'diagram-js/lib/core/EventBus';
import ElementTemplates from 'bpmn-js-properties-panel/lib/provider/camunda/element-templates/ElementTemplates';
import UpdateBusinessObjectHandler from 'bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectHandler';
import UpdateBusinessObjectListHandler from 'bpmn-js-properties-panel/lib/cmd/UpdateBusinessObjectListHandler';
import camunda from '../descriptors/camunda.json';
import inputOutputHelper from '../provider/camunda/parts/implementation/InputOutputHelper';
import inputOutput from '../provider/camunda/parts/implementation/InputOutput';
import inputOutputParameter from '../provider/camunda/parts/implementation/InputOutputParameter';
import inputOutputUpdater from '../provider/camunda/parts/implementation/InputOutputUpdater';
import workflowImplementationType from '../provider/camunda/parts/implementation/WorkflowImplementationType';
import workflowActivity from '../provider/camunda/parts/implementation/WorkflowActivity';
import delegate from '../provider/camunda/parts/implementation/Delegate';
import resultVariable from '../provider/camunda/parts/implementation/ResultVariable';
import WorkflowPropertiesProvider from '../provider/camunda/WorkflowPropertiesProvider';

const translate = value => value;
// Jest 21 predates test.each; keep scenarios individually named and reported.
const cases = rows => (name, scenario) =>
    rows.forEach(row => {
        const args = Array.isArray(row) ? row : [row];
        it(`${name}: ${JSON.stringify(row)}`, () => scenario(...args));
    });

describe('workflow BPMN properties', () => {
    let moddle;
    let element;
    let bo;
    let objectHandler;
    let listHandler;

    const create = (type, properties = {}) => moddle.create(type, properties);
    const shape = (type, properties = {}) => ({
        type,
        businessObject: create(type, properties)
    });
    const apply = commands => {
        (Array.isArray(commands) ? commands : [commands]).forEach(command => {
            if (Array.isArray(command)) {
                apply(command);
            } else if (command) {
                const handler =
                    command.cmd === 'properties-panel.update-businessobject'
                        ? objectHandler
                        : listHandler;
                expect([
                    'properties-panel.update-businessobject',
                    'properties-panel.update-businessobject-list'
                ]).toContain(command.cmd);
                handler.execute(command.context);
            }
        });
    };
    const extensions = values => {
        bo.extensionElements = create('bpmn:ExtensionElements', { values });
        bo.extensionElements.$parent = bo;
        values.forEach(value => {
            value.$parent = bo.extensionElements;
        });
    };
    const entriesById = entries =>
        entries.reduce((result, entry) => {
            result[entry.id] = entry;
            return result;
        }, {});
    const nodeFor = entries => {
        const tab = document.createElement('div');
        tab.className = 'bpp-properties-tab';
        entries.forEach(entry => {
            const node = document.createElement('div');
            node.setAttribute('data-entry', entry.id);
            node.innerHTML = entry.html;
            tab.appendChild(node);
        });
        return tab;
    };

    beforeEach(() => {
        moddle = new BpmnModdle({ camunda });
        element = shape('bpmn:ServiceTask', { id: 'ServiceTask_1' });
        bo = element.businessObject;
        objectHandler = new UpdateBusinessObjectHandler({});
        listHandler = new UpdateBusinessObjectListHandler({}, moddle);
    });

    describe('parameter availability and lookup', () => {
        cases([
            ['bpmn:Process', {}, true, true, false],
            ['bpmn:ServiceTask', {}, true, true, true],
            [
                'bpmn:ServiceTask',
                { implementation: 'activity:deploy' },
                true,
                true,
                false
            ],
            ['bpmn:StartEvent', {}, false, true, true],
            ['bpmn:BoundaryEvent', {}, false, true, true],
            ['bpmn:EndEvent', {}, true, false, true],
            ['bpmn:SubProcess', { triggeredByEvent: true }, false, true, true],
            ['bpmn:SubProcess', {}, true, true, true],
            ['bpmn:DataObjectReference', {}, false, true, true]
        ])(
            '%s obeys input/output and create/delete restrictions (%j)',
            (type, properties, supportsIO, supportsOutput, supportsEdit) => {
                const target = shape(type, properties);
                expect(inputOutputHelper.isInputOutputSupported(target)).toBe(
                    supportsIO
                );
                expect(
                    inputOutputHelper.areOutputParametersSupported(target)
                ).toBe(supportsOutput);
                expect(inputOutputHelper.isCreateDeleteSupported(target)).toBe(
                    supportsEdit
                );
                expect(
                    inputOutputHelper.isInputOutputSupported(target, true)
                ).toBe(true);
                expect(
                    inputOutputHelper.areOutputParametersSupported(target, true)
                ).toBe(true);
            }
        );

        it('disables outputs for multi-instance tasks and distinguishes workflow input/source and output/target', () => {
            bo.loopCharacteristics = create(
                'bpmn:MultiInstanceLoopCharacteristics'
            );
            expect(
                inputOutputHelper.areOutputParametersSupported(element)
            ).toBe(false);
            const input = create('camunda:InputParameter');
            const output = create('camunda:OutputParameter');
            expect(
                inputOutputHelper.isWorkflowSourceSupported(element, input)
            ).toBe(true);
            expect(
                inputOutputHelper.isWorkflowSourceSupported(element, output)
            ).toBe(false);
            expect(
                inputOutputHelper.isWorkflowTargetSupported(element, output)
            ).toBe(true);
            expect(
                inputOutputHelper.isWorkflowTargetSupported(element, input)
            ).toBe(false);
            expect(
                inputOutputHelper.isWorkflowTargetSupported(
                    shape('bpmn:Task'),
                    output
                )
            ).toBe(false);
        });

        it('reads task parameters independently from connector parameters and returns empty lists for missing data', () => {
            expect(inputOutputHelper.getInputParameters(element)).toEqual([]);
            expect(
                inputOutputHelper.getOutputParameters(element, true)
            ).toEqual([]);
            expect(
                inputOutputHelper.getConnector(shape('bpmn:StartEvent'))
            ).toBeFalsy();
            const input = create('camunda:InputParameter', {
                name: 'taskInput'
            });
            const output = create('camunda:OutputParameter', {
                name: 'taskOutput'
            });
            const io = create('camunda:InputOutput', {
                inputParameters: [input],
                outputParameters: [output]
            });
            const connectorInput = create('camunda:InputParameter', {
                name: 'connectorInput'
            });
            const connectorIO = create('camunda:InputOutput', {
                inputParameters: [connectorInput]
            });
            const connector = create('camunda:Connector', {
                inputOutput: connectorIO
            });
            extensions([io, connector]);

            expect(inputOutputHelper.getInputOutput(element)).toBe(io);
            expect(inputOutputHelper.getInputOutput(element, true)).toBe(
                connectorIO
            );
            expect(inputOutputHelper.getConnector(element)).toBe(connector);
            expect(inputOutputHelper.getInputParameter(element, false, 0)).toBe(
                input
            );
            expect(
                inputOutputHelper.getOutputParameter(element, false, 0)
            ).toBe(output);
            expect(inputOutputHelper.getInputParameter(element, true, 0)).toBe(
                connectorInput
            );
            expect(
                inputOutputHelper.getOutputParameter(element, false, 5)
            ).toBeUndefined();
        });
    });

    describe('input/output parameter lists', () => {
        it('creates, selects, labels and removes input/output parameters with real panel entries', () => {
            const panel = inputOutput(element, moddle, undefined, translate);
            const [inputs, outputs] = panel.entries;
            const tab = nodeFor(panel.entries);
            const inputNode = tab.children[0];
            const outputNode = tab.children[1];
            expect(
                panel.getSelectedParameter(element, inputNode)
            ).toBeUndefined();

            inputs.createElement(element, inputNode);
            apply(inputs.set(element, {}, inputNode));
            const io = inputOutputHelper.getInputOutput(element);
            const input = io.inputParameters[0];
            expect(input.$instanceOf('camunda:InputParameter')).toBe(true);
            expect(input.$parent).toBe(io);
            expect(input.name).toMatch(/^Input_/);
            expect(panel.getSelectedParameter(element, inputNode)).toBe(input);
            expect(inputs.get(element, inputNode.firstChild)).toEqual([
                { extensionElementValue: input.name }
            ]);
            const option = document.createElement('option');
            inputs.setControlValue(
                element,
                inputNode,
                option,
                'name',
                'source',
                0
            );
            expect(option.text).toBe('source : Text');
            input.definition = create('camunda:List');
            inputs.setControlValue(element, inputNode, option, 'name', '', 0);
            expect(option.text).toBe(': List');

            outputs.createElement(element, outputNode);
            apply(outputs.set(element, {}, outputNode));
            const output = io.outputParameters[0];
            expect(output.$instanceOf('camunda:OutputParameter')).toBe(true);
            expect(output.$parent).toBe(io);
            expect(panel.getSelectedParameter(element, outputNode)).toBe(
                output
            );
            expect(
                tab.querySelector('#cam-extensionElements-inputs').selectedIndex
            ).toBe(-1);
            outputs.setControlValue(
                element,
                outputNode,
                option,
                'name',
                'target',
                0
            );
            expect(option.text).toBe('target : Text');
            outputs.removeElement(element, outputNode);
            apply(outputs.set(element, {}, outputNode));
            expect(io.outputParameters).toEqual([]);
            expect(inputOutputHelper.getInputOutput(element)).toBe(io);

            tab.querySelector(
                '#cam-extensionElements-inputs'
            ).selectedIndex = 0;
            inputs.selectElement(element, inputNode);
            inputs.removeElement(element, inputNode);
            apply(inputs.set(element, {}, inputNode));
            expect(inputOutputHelper.getInputOutput(element)).toBeUndefined();
        });

        it('creates connector-local parameter data and removes it after the last output is removed', () => {
            const connector = create('camunda:Connector');
            extensions([connector]);
            const panel = inputOutput(
                element,
                moddle,
                { insideConnector: true, idPrefix: 'connector-' },
                translate
            );
            const tab = nodeFor(panel.entries);
            const output = panel.entries[1];
            const node = tab.children[1];
            output.createElement(element, node);
            apply(output.set(element, {}, node));
            expect(connector.inputOutput.$parent).toBe(connector);
            expect(connector.inputOutput.outputParameters).toHaveLength(1);
            expect(bo.extensionElements.values).toEqual([connector]);
            output.removeElement(element, node);
            apply(output.set(element, {}, node));
            expect(connector.inputOutput).toBeUndefined();
        });

        it('keeps activity parameters read-only and omits unsupported parameter sections', () => {
            bo.implementation = 'activity:deploy';
            const panel = inputOutput(element, moddle, {}, translate);
            expect(panel.entries[0].html).not.toContain(
                'data-action="createElement"'
            );
            expect(panel.entries[1].html).not.toContain(
                'data-action="removeElement"'
            );
            expect(
                inputOutput(shape('bpmn:StartEvent'), moddle, {}, translate)
                    .entries
            ).toEqual([]);
            expect(
                inputOutput(shape('bpmn:EndEvent'), moddle, {}, translate)
                    .entries
            ).toHaveLength(1);
        });
    });

    describe('parameter value editing', () => {
        let selected;
        let entries;
        let tab;
        let node;

        beforeEach(() => {
            selected = create('camunda:InputParameter', {
                name: 'source',
                value: 'before'
            });
            entries = entriesById(
                inputOutputParameter(
                    element,
                    moddle,
                    { getSelectedParameter: () => selected },
                    translate
                )
            );
            tab = nodeFor(Object.values(entries));
            node = tab.children[0];
        });

        it('validates names, retains invalid draft text, and edits valid names without touching values', () => {
            const name = entries.parameterName;
            expect(name.get(element, node)).toEqual({ name: 'source' });
            expect(name.validate(element, { name: '' }, node)).toEqual({
                name: 'Parameter must have a name'
            });
            expect(name.validate(element, { name: 'has space' }, node)).toEqual(
                { name: 'Name must not contain spaces' }
            );
            apply(name.set(element, { name: 'invalid name' }, node));
            expect(selected.name).toBe('source');
            expect(name.get(element, node)).toEqual({ name: 'invalid name' });
            apply(name.set(element, { name: 'renamed' }, node));
            expect(selected.name).toBe('renamed');
            expect(selected.value).toBe('before');
            expect(name.isHidden(element, node)).toBe(true);
            expect(name.isDisabled(element)).toBe(false);
            bo.implementation = 'activity:deploy';
            expect(name.isDisabled(element)).toBe(true);
            expect(entries.parameterType.isDisabled(element)).toBe(true);
            selected = undefined;
            expect(name.isHidden(element, node)).toBe(false);
            expect(name.get(element, node)).toEqual({ name: undefined });
            expect(name.validate(element, { name: '' }, node)).toEqual({});
        });

        cases([
            ['script', 'camunda:Script'],
            ['list', 'camunda:List'],
            ['map', 'camunda:Map']
        ])(
            'switches a text parameter to %s and back without retaining stale values',
            (type, moddleType) => {
                const entry = entries.parameterType;
                expect(entry.get(element, node)).toEqual({
                    parameterType: 'text'
                });
                apply(entry.set(element, { parameterType: type }, node));
                expect(selected.value).toBeUndefined();
                expect(selected.definition.$instanceOf(moddleType)).toBe(true);
                expect(selected.definition.$parent).toBe(selected);
                expect(entry.get(element, node)).toEqual({
                    parameterType: type
                });
                apply(entry.set(element, { parameterType: 'text' }, node));
                expect(selected.definition).toBeUndefined();
                expect(entry.get(element, node)).toEqual({
                    parameterType: 'text'
                });
                selected = undefined;
                expect(entry.get(element, node)).toEqual({
                    parameterType: 'text'
                });
            }
        );

        it('edits text values and removes cleared values from the moddle object', () => {
            const text = entries['parameterType-text'];
            expect(text.get(element, node)).toEqual({ value: 'before' });
            expect(text.isShown(element, node)).toBe(true);
            apply(text.set(element, { value: 'after' }, node));
            expect(selected.value).toBe('after');
            apply(text.set(element, { value: '' }, node));
            expect(selected.value).toBeUndefined();
            selected.definition = create('camunda:Map');
            expect(text.isShown(element, node)).toBe(false);
            selected = undefined;
            expect(text.get(element, node)).toEqual({ value: undefined });
        });

        it('edits inline and external scripts and exposes required language validation', () => {
            const script = entries['parameterType-script'];
            expect(script.get(element, node)).toEqual({});
            expect(script.validate(element, {}, node)).toEqual({});
            expect(script.isScript(element, node)).toBeFalsy();
            apply(
                entries.parameterType.set(
                    element,
                    { parameterType: 'script' },
                    node
                )
            );
            expect(script.isScript(element, node)).toBe(true);
            expect(script.validate(element, {}, node)).toEqual({
                scriptFormat: 'Must provide a value',
                scriptValue: 'Must provide a value'
            });
            apply(
                script.set(
                    element,
                    {
                        scriptType: 'script',
                        scriptFormat: 'groovy',
                        scriptValue: 'return 1'
                    },
                    node
                )
            );
            expect(selected.definition.value).toBe('return 1');
            expect(script.get(element, node)).toEqual({
                scriptType: 'script',
                scriptFormat: 'groovy',
                scriptValue: 'return 1'
            });
            expect(script.validate(element, {}, node)).toEqual({});
            apply(
                script.set(
                    element,
                    {
                        scriptType: 'scriptResource',
                        scriptFormat: 'javascript',
                        scriptResourceValue: 'deployment://script.js'
                    },
                    node
                )
            );
            expect(selected.definition.value).toBeUndefined();
            expect(script.get(element, node)).toEqual({
                scriptType: 'scriptResource',
                scriptFormat: 'javascript',
                scriptResourceValue: 'deployment://script.js'
            });
        });

        it('rejects empty inline script bodies and external resource paths after a language has been selected', () => {
            const script = entries['parameterType-script'];
            selected.definition = create('camunda:Script', {
                scriptFormat: 'groovy',
                value: ''
            });
            expect(script.validate(element, {}, node)).toEqual({
                scriptValue: 'Must provide a value'
            });

            selected.definition.set('value', undefined);
            selected.definition.set('camunda:resource', '');
            expect(script.validate(element, {}, node)).toEqual({
                scriptResourceValue: 'Must provide a value'
            });
            selected.definition.set(
                'camunda:resource',
                'deployment://script.groovy'
            );
            expect(script.validate(element, {}, node)).toEqual({});
        });

        it('adds, edits and deletes list values using real table entry actions', () => {
            const list = entries['parameterType-list'];
            const listNode = tab.querySelector(
                '[data-entry="parameterType-list"]'
            );
            expect(list.get(element, listNode)).toEqual([]);
            apply(
                entries.parameterType.set(
                    element,
                    { parameterType: 'list' },
                    node
                )
            );
            list.addElement(element, listNode);
            apply(list.set(element, [], listNode));
            expect(selected.definition.items).toHaveLength(1);
            expect(selected.definition.items[0].$parent).toBe(
                selected.definition
            );
            apply(list.set(element, [{ value: 'first' }], listNode));
            expect(selected.definition.items[0].value).toBe('first');
            expect(list.get(element, listNode)).toEqual([{ value: 'first' }]);
            expect(list.show(element, listNode)).toBe(true);
            const input = document.createElement('input');
            expect(
                list.editable(element, listNode, input, 'value', 'first', 0)
            ).toBe(true);
            list.setControlValue(element, listNode, input, 'value', 'first', 0);
            expect(input.value).toBe('first');
            const row = listNode.querySelector('[data-list-entry-container]')
                .children[0];
            row.setAttribute('data-index', '0');
            list.deleteElement(element, listNode, {
                delegateTarget: row.querySelector('button')
            });
            apply(list.set(element, [], listNode));
            expect(selected.definition.items).toEqual([]);
        });

        cases([
            ['camunda:Map', 'Map'],
            ['camunda:List', 'List'],
            ['camunda:Script', 'Script']
        ])(
            'protects nested list %s values and renders their type',
            (type, label) => {
                const list = entries['parameterType-list'];
                const listNode = tab.querySelector(
                    '[data-entry="parameterType-list"]'
                );
                selected.definition = create('camunda:List', {
                    items: [create(type)]
                });
                const input = document.createElement('input');
                expect(
                    list.editable(element, listNode, input, 'value', '', 0)
                ).toBe(false);
                list.setControlValue(element, listNode, input, 'value', '', 0);
                expect(input.value).toBe(label);
                expect(
                    list.set(
                        element,
                        [{ value: 'overwrite nested value' }],
                        listNode
                    )
                ).toEqual([]);
            }
        );

        it('adds, edits and deletes map entries while preserving nested definitions', () => {
            const map = entries['parameterType-map'];
            const mapNode = tab.querySelector(
                '[data-entry="parameterType-map"]'
            );
            expect(map.get(element, mapNode)).toEqual([]);
            apply(
                entries.parameterType.set(
                    element,
                    { parameterType: 'map' },
                    node
                )
            );
            map.addElement(element, mapNode);
            apply(map.set(element, [], mapNode));
            const item = selected.definition.entries[0];
            expect(item.$parent).toBe(selected.definition);
            apply(map.set(element, [{ key: 'key', value: 'value' }], mapNode));
            expect(map.get(element, mapNode)).toEqual([
                { key: 'key', value: 'value' }
            ]);
            expect(map.show(element, mapNode)).toBe(true);
            const input = document.createElement('input');
            expect(map.editable(element, mapNode, input, 'value', '', 0)).toBe(
                true
            );
            map.setControlValue(element, mapNode, input, 'value', 'value', 0);
            expect(input.value).toBe('value');
            item.definition = create('camunda:List');
            expect(map.editable(element, mapNode, input, 'value', '', 0)).toBe(
                false
            );
            expect(map.editable(element, mapNode, input, 'key', '', 0)).toBe(
                true
            );
            apply(
                map.set(
                    element,
                    [{ key: 'renamed', value: 'do not overwrite' }],
                    mapNode
                )
            );
            expect(item.key).toBe('renamed');
            expect(item.value).toBe('value');
            expect(item.definition.$type).toBe('camunda:List');
            map.setControlValue(element, mapNode, input, 'value', '', 0);
            expect(input.value).toBe('List');
            map.setControlValue(element, mapNode, input, 'key', 'renamed', 0);
            expect(input.value).toBe('renamed');
            const row = mapNode.querySelector('[data-list-entry-container]')
                .children[0];
            row.setAttribute('data-index', '0');
            map.deleteElement(element, mapNode, {
                delegateTarget: row.querySelector('button')
            });
            apply(map.set(element, [], mapNode));
            expect(selected.definition.entries).toEqual([]);
        });

        it('hides structured value tables when no matching parameter is selected', () => {
            expect(
                entries['parameterType-list'].show(element, node)
            ).toBeUndefined();
            expect(
                entries['parameterType-map'].show(element, node)
            ).toBeUndefined();
            selected = undefined;
            expect(entries['parameterType-list'].get(element, node)).toEqual(
                []
            );
            expect(entries['parameterType-map'].get(element, node)).toEqual([]);
            expect(
                inputOutputParameter(
                    shape('bpmn:StartEvent'),
                    moddle,
                    {},
                    translate
                )
            ).toEqual([]);
        });
    });

    describe('service task implementation', () => {
        const options = overrides => ({
            getBusinessObject: target => target.businessObject,
            getImplementationType: target => target.businessObject.selectedType,
            ...overrides
        });

        cases([
            ['class', 'camunda:class', 'Java Class'],
            ['expression', 'camunda:expression', 'Expression'],
            [
                'delegateExpression',
                'camunda:delegateExpression',
                'Delegate Expression'
            ]
        ])(
            'reads, validates, updates and clears %s delegates',
            (type, attribute, label) => {
                bo.selectedType = type;
                bo.set(attribute, 'before');
                const entry = delegate(
                    element,
                    moddle,
                    options(),
                    translate
                )[0];
                expect(entry.get(element)).toEqual({
                    delegate: 'before',
                    delegationLabel: label
                });
                expect(entry.isHidden(element)).toBe(true);
                expect(entry.validate(element, { delegate: '' })).toEqual({
                    delegate: 'Must provide a value'
                });
                expect(entry.validate(element, { delegate: 'after' })).toEqual(
                    {}
                );
                apply(entry.set(element, { delegate: 'after' }));
                expect(bo.get(attribute)).toBe('after');
                apply(entry.set(element, { delegate: '' }));
                expect(bo.get(attribute)).toBe('');
            }
        );

        it('hides delegate editing for workflow activities and reads empty unsupported labels', () => {
            bo.selectedType = 'workflowActivity';
            const entry = delegate(element, moddle, options(), translate)[0];
            expect(entry.isHidden(element)).toBe(false);
            expect(entry.validate(element, { delegate: '' })).toEqual({});
            expect(entry.get(element).delegationLabel).toBe('');
        });

        it('clears result variables and restores DMN result-list mapping, with optional visibility callbacks', () => {
            element = shape('bpmn:BusinessRuleTask', {
                'camunda:resultVariable': 'answer',
                'camunda:mapDecisionResult': 'singleEntry'
            });
            bo = element.businessObject;
            const entry = resultVariable(
                element,
                moddle,
                options({
                    hideResultVariable: () => true,
                    id: 'custom-result'
                }),
                translate
            )[0];
            expect(entry.get(element)).toEqual({ resultVariable: 'answer' });
            expect(entry.isHidden(element)).toBe(false);
            apply(entry.set(element, { resultVariable: '' }));
            expect(bo.get('camunda:resultVariable')).toBeUndefined();
            expect(bo.get('camunda:mapDecisionResult')).toBe('resultList');
            const plainEntry = resultVariable(
                element,
                moddle,
                options(),
                translate
            )[0];
            expect(plainEntry.isHidden(element)).toBe(true);
            apply(plainEntry.set(element, { resultVariable: 'new answer' }));
            expect(bo.get('camunda:resultVariable')).toBe('new answer');
        });

        it('changes delegate types without losing the existing delegate value and removes obsolete parameter extensions', () => {
            bo.selectedType = 'class';
            bo.set('camunda:class', 'com.example.Delegate');
            bo.implementation = 'activity:old';
            const io = create('camunda:InputOutput');
            const listener = create('camunda:ExecutionListener');
            extensions([io, listener]);
            const entry = workflowImplementationType(
                element,
                moddle,
                options(),
                translate
            )[0];
            expect(entry.get(element)).toEqual({ implType: 'class' });
            apply(entry.set(element, { implType: 'expression' }));
            expect(bo.get('camunda:expression')).toBe('com.example.Delegate');
            expect(bo.get('camunda:class')).toBeUndefined();
            expect(bo.implementation).toBeUndefined();
            expect(bo.extensionElements.values).toEqual([listener]);
            bo.selectedType = undefined;
            expect(entry.get(element)).toEqual({ implType: '' });
            apply(entry.set(element, { implType: 'delegateExpression' }));
            expect(bo.get('camunda:delegateExpression')).toBe('');
        });

        cases(['dmn', 'external', 'script', 'connector', 'workflowActivity'])(
            'initializes %s implementation and clears incompatible implementation data',
            type => {
                bo.selectedType = 'expression';
                bo.set('camunda:expression', '${old}');
                bo.set('camunda:resultVariable', 'old result');
                const entry = workflowImplementationType(
                    element,
                    moddle,
                    options({
                        hasDmnSupport: true,
                        hasExternalSupport: true,
                        hasServiceTaskLikeSupport: true,
                        hasScriptSupport: true
                    }),
                    translate
                )[0];
                apply(entry.set(element, { implType: type }));
                expect(bo.get('camunda:expression')).toBeUndefined();
                expect(bo.get('camunda:resultVariable')).toBeUndefined();
                if (type === 'dmn') {
                    expect(bo.get('camunda:decisionRef')).toBe('');
                    expect(bo.get('camunda:decisionRefBinding')).toBe('latest');
                    expect(bo.get('camunda:mapDecisionResult')).toBe(
                        'resultList'
                    );
                } else if (type === 'external') {
                    expect(bo.get('camunda:type')).toBe('external');
                    expect(bo.get('camunda:topic')).toBe('');
                } else if (type === 'script') {
                    expect(bo.get('camunda:script').$type).toBe(
                        'camunda:Script'
                    );
                    expect(bo.get('camunda:script').$parent).toBe(bo);
                } else if (type === 'connector') {
                    expect(
                        inputOutputHelper.getConnector(element).$parent
                    ).toBe(bo.extensionElements);
                } else {
                    expect(bo.implementation).toBe('');
                }
            }
        );

        it('replaces an existing connector and retains unrelated extensions', () => {
            const oldConnector = create('camunda:Connector');
            const listener = create('camunda:ExecutionListener');
            extensions([oldConnector, listener]);
            const entry = workflowImplementationType(
                element,
                moddle,
                options({ hasServiceTaskLikeSupport: true }),
                translate
            )[0];
            apply(entry.set(element, { implType: 'connector' }));
            expect(bo.extensionElements.values).toHaveLength(2);
            expect(bo.extensionElements.values).toContain(listener);
            expect(bo.extensionElements.values).not.toContain(oldConnector);
            expect(inputOutputHelper.getConnector(element).$type).toBe(
                'camunda:Connector'
            );
        });

        it('sets the selected activity, execution expression, task label and fresh typed parameters', () => {
            bo.selectedType = 'workflowActivity';
            bo.implementation = 'activity:old';
            const validation = [];
            const config = {
                activities: [{ value: 'deploy', name: 'Deploy' }],
                getActivityInputsOutputs: name => {
                    expect(name).toBe('deploy');
                    return {
                        inputs: [{ name: 'request', value: 'default request' }],
                        outputs: [{ name: 'response', value: '${result}' }]
                    };
                },
                validationUpdate: (target, valid) =>
                    validation.push({ target, valid })
            };
            const entry = workflowActivity(
                element,
                config,
                moddle,
                options(),
                translate
            )[0];
            expect(entry.get(element)).toEqual({ workflowActivity: 'old' });
            expect(entry.isHidden(element)).toBe(true);
            expect(entry.validate(element, { workflowActivity: '' })).toEqual({
                workflowActivity: 'Must provide a value'
            });
            expect(
                entry.validate(element, { workflowActivity: 'deploy' })
            ).toEqual({});
            expect(validation).toEqual([
                { target: element, valid: false },
                { target: element, valid: true }
            ]);
            apply(entry.set(element, { workflowActivity: 'deploy' }));
            expect(bo.implementation).toBe('activity:deploy');
            expect(bo.get('camunda:expression')).toBe(
                '${ExecuteActivity.execute(execution)}'
            );
            expect(bo.name).toBe('deploy');
            const io = inputOutputHelper.getInputOutput(element);
            expect(io.inputParameters[0].name).toBe('request');
            expect(io.inputParameters[0].value).toBe('default request');
            expect(io.outputParameters[0].value).toBe('${result}');
            expect(io.inputParameters[0].$parent).toBe(io);
            bo.implementation = 'unrecognized';
            bo.selectedType = 'class';
            expect(entry.get(element)).toEqual({ workflowActivity: '' });
            expect(entry.isHidden(element)).toBe(false);
            expect(entry.validate(element, { workflowActivity: '' })).toEqual(
                {}
            );
            bo.implementation = undefined;
            expect(entry.get(element)).toEqual({ workflowActivity: '' });
        });

        it('replaces existing activity parameters while preserving other extensions', () => {
            const previous = create('camunda:InputOutput', {
                inputParameters: [
                    create('camunda:InputParameter', {
                        name: 'stale',
                        value: 'edited'
                    })
                ]
            });
            const listener = create('camunda:ExecutionListener');
            extensions([listener, previous]);
            apply(
                inputOutputUpdater({
                    element,
                    bo,
                    bpmnFactory: moddle,
                    activityInputsOutputs: {
                        inputs: [],
                        outputs: [{ name: 'new', value: 'default' }]
                    }
                })
            );
            expect(bo.extensionElements.values).toHaveLength(2);
            expect(bo.extensionElements.values[0]).toBe(listener);
            const io = inputOutputHelper.getInputOutput(element);
            expect(io).not.toBe(previous);
            expect(io.inputParameters).toEqual([]);
            expect(io.outputParameters[0].$type).toBe(
                'camunda:OutputParameter'
            );
            expect(io.outputParameters[0].name).toBe('new');
            expect(io.outputParameters[0].value).toBe('default');
        });
    });

    describe('assembled workflow properties provider', () => {
        let provider;

        beforeEach(() => {
            provider = new WorkflowPropertiesProvider(
                {
                    activities: [{ value: 'deploy', name: 'Deploy' }],
                    getActivityInputsOutputs: () => ({
                        inputs: [],
                        outputs: []
                    }),
                    validationUpdate: () => {}
                },
                new EventBus(),
                moddle,
                { get: () => undefined },
                new ElementTemplates(),
                translate
            );
        });

        const groups = tabs => entriesById(tabs[0].groups);

        it('replaces general and input/output tabs once while retaining upstream tabs', () => {
            const tabs = provider.getTabs(element);
            expect(tabs.map(tab => tab.id)).toEqual([
                'general',
                'input-output',
                'variables',
                'connector',
                'forms',
                'listeners',
                'field-injections',
                'extensionElements'
            ]);
            const details = entriesById(groups(tabs).details.entries);
            expect(details.implementation).toBeDefined();
            expect(details.activitySelect).toBeDefined();
            expect(details.delegate).toBeDefined();
            expect(details.resultVariable).toBeDefined();
            expect(
                groups(tabs).details.entries.filter(
                    entry => entry.id === 'implementation'
                )
            ).toHaveLength(1);
            expect(details.activitySelect.isHidden(element)).toBe(false);
            expect(details.resultVariable.isHidden(element)).toBe(false);

            apply(
                details.implementation.set(element, {
                    implType: 'workflowActivity'
                })
            );
            expect(details.implementation.get(element)).toEqual({
                implType: 'workflowActivity'
            });
            expect(details.activitySelect.isHidden(element)).toBe(true);
            apply(
                details.activitySelect.set(element, {
                    workflowActivity: 'deploy'
                })
            );
            expect(details.implementation.get(element)).toEqual({
                implType: 'workflowActivity'
            });
            expect(details.delegate.isHidden(element)).toBe(false);
            expect(details.resultVariable.isHidden(element)).toBe(false);
            apply(
                details.implementation.set(element, { implType: 'expression' })
            );
            expect(details.implementation.get(element)).toEqual({
                implType: 'expression'
            });
            expect(details.resultVariable.isHidden(element)).toBe(true);
            apply(details.implementation.set(element, { implType: 'class' }));
            expect(details.implementation.get(element)).toEqual({
                implType: 'class'
            });
        });

        it('enables parameter detail groups for the selected input or output and labels their direction', () => {
            const io = create('camunda:InputOutput', {
                inputParameters: [
                    create('camunda:InputParameter', { name: 'source' })
                ],
                outputParameters: [
                    create('camunda:OutputParameter', { name: 'target' })
                ]
            });
            extensions([io]);
            const tab = provider.getTabs(element)[1];
            const listEntries = tab.groups[0].entries;
            const panelNode = nodeFor(listEntries);
            const node = panelNode.children[0];
            const inputSelect = panelNode.querySelector(
                '#cam-extensionElements-inputs'
            );
            const outputSelect = panelNode.querySelector(
                '#cam-extensionElements-outputs'
            );
            inputSelect.innerHTML = '<option>source</option>';
            outputSelect.innerHTML = '<option>target</option>';
            inputSelect.selectedIndex = -1;
            outputSelect.selectedIndex = -1;
            const details = tab.groups[1];
            expect(details.enabled(element, node)).toBeUndefined();
            expect(details.label(element, node)).toBe('');
            inputSelect.selectedIndex = 0;
            expect(details.enabled(element, node)).toBe(io.inputParameters[0]);
            expect(details.label(element, node)).toBe('Input Parameter');
            inputSelect.selectedIndex = -1;
            outputSelect.selectedIndex = 0;
            expect(details.enabled(element, node)).toBe(io.outputParameters[0]);
            expect(details.label(element, node)).toBe('Output Parameter');
        });

        it('adds process-definition hints and resolves external labels to their target', () => {
            const process = shape('bpmn:Process', {
                id: 'Process_1',
                isExecutable: true
            });
            const processGroups = groups(provider.getTabs(process));
            expect(
                entriesById(processGroups.general.entries).id.description
            ).toBe('This maps to the process definition key.');
            const participant = shape('bpmn:Participant', {
                id: 'Participant_1',
                processRef: process.businessObject
            });
            const participantGroups = groups(provider.getTabs(participant));
            expect(
                participantGroups.general.entries.some(
                    entry =>
                        entry.description ===
                        'This maps to the process definition key.'
                )
            ).toBe(true);
            const labeled = { ...element, labelTarget: element };
            expect(
                groups(provider.getTabs(labeled)).details.entries.some(
                    entry => entry.id === 'activitySelect'
                )
            ).toBe(true);
        });

        it('enables job and external task configuration only when supported by the selected element', () => {
            const general = groups(provider.getTabs(element));
            const job = general.jobConfiguration;
            const external = general.externalTaskConfiguration;
            expect(job.enabled(element)).toBe(false);
            expect(external.enabled(element)).toBe(false);
            bo.set('camunda:type', 'external');
            expect(external.enabled(element)).toBe(true);
            bo.set('camunda:asyncBefore', true);
            expect(job.enabled(element)).toBe(true);
            bo.set('camunda:asyncBefore', false);
            bo.set('camunda:asyncAfter', true);
            expect(job.enabled(element)).toBe(true);
            const process = shape('bpmn:Process');
            const participant = shape('bpmn:Participant', {
                processRef: process.businessObject
            });
            [process, participant].forEach(target => {
                expect(job.enabled(target)).toBe(true);
                expect(external.enabled(target)).toBe(true);
            });
            const emptyParticipant = shape('bpmn:Participant');
            expect(job.enabled(emptyParticipant)).toBe(false);
            expect(external.enabled(emptyParticipant)).toBe(false);
            const timer = shape('bpmn:IntermediateCatchEvent', {
                eventDefinitions: [create('bpmn:TimerEventDefinition')]
            });
            expect(job.enabled(timer)).toBe(true);
            expect(job.enabled(shape('bpmn:StartEvent'))).toBe(false);
            expect(external.enabled(timer)).toBe(false);
            const plainTabs = provider.getTabs(shape('bpmn:Task'));
            expect(
                groups(plainTabs).details.entries.some(
                    entry => entry.id === 'activitySelect'
                )
            ).toBe(false);
        });
    });
});
