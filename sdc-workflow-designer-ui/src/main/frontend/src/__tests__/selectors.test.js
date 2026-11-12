/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import reducer from '../rootReducers';
import {
    setWorkflowVersionAction,
    workflowVersionDetailsChangedAction,
    versionStateChangedAction,
    toggleCompositionUpdate,
    setOperationModeAction,
    getIsCompositionUpdating
} from 'features/version/versionConstants';
import { setWorkflowAction } from 'features/workflow/workflowConstants';
import { versionListFetchAction } from 'features/workflow/overview/overviewConstansts';
import {
    getSortedVersions,
    getLatestBaseId,
    getAllIsVersionsCertifies,
    getWorkflowData,
    getSelectedVersionId
} from 'features/workflow/overview/overviewSelectors';
import { getIsCertified } from 'features/version/general/generalSelectors';
import { getSavedObjParams } from 'features/version/versionController/versionControllerSelectors';
import {
    setInputsOutputs,
    changeError,
    showOutputs
} from 'features/version/inputOutput/inputOutputActions';
import {
    getInputOutputForComposition,
    getIOErrors
} from 'features/version/inputOutput/inputOutputSelectors';
import {
    getErrors,
    getCompositionHasErrors
} from 'features/version/composition/compositionSelectors';
import { activitiesSelector } from 'features/activities/activitiesSelectors';

it('preserves version metadata when details, state and composition-update status change', () => {
    let state = reducer(
        undefined,
        setWorkflowVersionAction({
            id: 'v1',
            name: '1.0',
            description: 'Old',
            state: 'draft'
        })
    );
    state = reducer(
        state,
        workflowVersionDetailsChangedAction({ description: 'New' })
    );
    state = reducer(state, versionStateChangedAction({ state: 'CERTIFIED' }));
    state = reducer(state, toggleCompositionUpdate(true));
    expect(getIsCertified(state)).toBe(true);
    expect(getIsCompositionUpdating(state)).toBe(true);
    expect(getSelectedVersionId(state)).toBe('v1');
    expect(state.currentVersion.general).toEqual({
        id: 'v1',
        name: '1.0',
        description: 'New',
        state: 'CERTIFIED',
        isCompositionUpdating: true
    });
    state = reducer(state, toggleCompositionUpdate(false));
    state = reducer(state, setOperationModeAction());
    expect(getIsCompositionUpdating(state)).toBe(false);
    expect(state.currentVersion.operationMode).toBe(true);
    expect(reducer(state, { type: 'UNRELATED' })).toBe(state);
});

it('selects a save payload with the complete inputs, outputs and raw composition', () => {
    let state = reducer(
        undefined,
        setWorkflowVersionAction({ id: 'v1', name: '1.0', state: 'draft' })
    );
    state = reducer(
        state,
        setInputsOutputs({
            inputs: [{ name: 'vm', type: 'STRING', mandatory: true }],
            outputs: [{ name: 'result', type: 'BOOLEAN' }]
        })
    );
    expect(getSavedObjParams(state)).toEqual({
        id: 'v1',
        name: '1.0',
        state: 'draft',
        composition: expect.stringContaining('bpmn2:definitions'),
        inputs: [{ name: 'vm', type: 'STRING', mandatory: true }],
        outputs: [{ name: 'result', type: 'BOOLEAN' }]
    });
    expect(getInputOutputForComposition(state)).toEqual({
        inputs: [{ name: 'vm', type: 'string', mandatory: true }],
        outputs: [{ name: 'result', type: 'boolean' }]
    });
    expect(state.currentVersion.inputOutput.inputs[0].type).toBe('STRING');
});

it('combines input and output validation errors for save-button gating', () => {
    let state = reducer(undefined, { type: '@@INIT' });
    expect(getIOErrors(state)).toBe(false);
    state = reducer(
        state,
        changeError({
            alreadyExists: [],
            invalidCharacters: [],
            emptyName: [0]
        })
    );
    expect(getIOErrors(state)).toBe(true);
    state = reducer(
        state,
        changeError({ alreadyExists: [], invalidCharacters: [], emptyName: [] })
    );
    state = reducer(state, showOutputs());
    state = reducer(
        state,
        changeError({
            alreadyExists: [0, 1],
            invalidCharacters: [],
            emptyName: []
        })
    );
    expect(getIOErrors(state)).toBe(true);
    state = reducer(
        state,
        changeError({
            alreadyExists: [],
            invalidCharacters: [0],
            emptyName: []
        })
    );
    expect(getIOErrors(state)).toBe(true);
});

it('derives workflow metadata, latest version and certification across versions', () => {
    let state = reducer(
        undefined,
        setWorkflowAction({
            id: 'w1',
            name: 'Workflow',
            description: 'Description',
            creationTime: 100,
            modificationTime: 200
        })
    );
    state = reducer(
        state,
        versionListFetchAction({
            items: [
                { id: 'v2', name: '2.0', state: 'CERTIFIED' },
                { id: 'v1', name: '1.0', state: 'certified' }
            ]
        })
    );
    expect(getSortedVersions(state).map(item => item.id)).toEqual(['v1', 'v2']);
    expect(getLatestBaseId(state)).toBe('v2');
    expect(getAllIsVersionsCertifies(state)).toBe(true);
    expect(getWorkflowData(state)).toEqual({
        id: 'w1',
        name: 'Workflow',
        description: 'Description',
        created: 100,
        modified: 200
    });
    state = reducer(
        state,
        versionListFetchAction({
            items: [{ id: 'v3', name: '3.0', state: 'draft' }]
        })
    );
    expect(getAllIsVersionsCertifies(state)).toBe(false);
});

it('handles absent optional selector state and empty version lists', () => {
    expect(getIsCertified({ currentVersion: { general: {} } })).toBeUndefined();
    expect(
        getIsCertified({ currentVersion: { general: { state: 'draft' } } })
    ).toBe(false);
    expect(getCompositionHasErrors(undefined)).toBeUndefined();
    expect(getCompositionHasErrors({})).toBeUndefined();
    expect(getCompositionHasErrors({ currentVersion: {} })).toBeUndefined();
    expect(getErrors(undefined)).toBeUndefined();
    expect(activitiesSelector(undefined)).toBeUndefined();
    expect(getLatestBaseId(reducer(undefined, {}))).toBeUndefined();
});

it('sorts version choices without mutating the Redux state array', () => {
    const versions = Object.freeze([
        { id: 'v2', name: '2.0', state: 'draft' },
        { id: 'v1', name: '1.0', state: 'draft' }
    ]);
    const state = { workflow: { versions } };
    expect(getSortedVersions(state).map(item => item.id)).toEqual(['v1', 'v2']);
    expect(versions.map(item => item.id)).toEqual(['v2', 'v1']);
});
