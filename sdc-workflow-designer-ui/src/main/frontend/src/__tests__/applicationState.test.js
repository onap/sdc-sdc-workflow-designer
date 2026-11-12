/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import reducer from '../rootReducers';
import { setPluginContext } from '../pluginContext/pluginContextActions';
import { pluginContextSelector } from '../pluginContext/pluginContextSelector';
import { setActivitiesList } from 'features/activities/activitiesActions';
import { activitiesSelector } from 'features/activities/activitiesSelectors';
import {
    updateComposition,
    updateValidation,
    deleteCompositionArtifact
} from 'features/version/composition/compositionActions';
import {
    getComposition,
    getCompositionHasErrors
} from 'features/version/composition/compositionSelectors';
import BpmnModdle from 'bpmn-moddle';

it('starts with a parseable BPMN diagram and empty application state', done => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.activities).toEqual([]);
    expect(state.currentVersion.general.isCompositionUpdating).toBe(false);
    expect(getCompositionHasErrors(state)).toBe(false);
    new BpmnModdle().fromXML(getComposition(state), (error, definitions) => {
        if (error) return done(error);
        expect(definitions.rootElements[0].$type).toBe('bpmn:Process');
        done();
    });
});

it('keeps plugin context and certified activity choices available to consumers', () => {
    let state = reducer(
        undefined,
        setPluginContext({ serviceId: 'service-1' })
    );
    state = reducer(
        state,
        setActivitiesList([{ id: 'a1', name: 'Install', inputs: [] }])
    );
    expect(pluginContextSelector(state)).toEqual({ serviceId: 'service-1' });
    expect(activitiesSelector(state)).toEqual([
        { id: 'a1', name: 'Install', inputs: [], value: 'Install' }
    ]);
});

it('updates validation for one canvas element without dropping other errors', () => {
    let state = reducer(undefined, updateComposition('<diagram/>'));
    state = reducer(
        state,
        updateValidation({ element: { id: 'task-1' }, isValid: false })
    );
    state = reducer(
        state,
        updateValidation({ element: { id: 'task-2' }, isValid: false })
    );
    state = reducer(
        state,
        updateValidation({ element: { id: 'task-1' }, isValid: true })
    );
    expect(getComposition(state)).toBe('<diagram/>');
    expect(getCompositionHasErrors(state)).toBe(true);
    expect(state.currentVersion.composition.errors).toEqual([
        { element: { id: 'task-2' }, isValid: false },
        { element: { id: 'task-1' }, isValid: true }
    ]);
    state = reducer(
        state,
        updateValidation({ element: { id: 'task-2' }, isValid: true })
    );
    expect(getCompositionHasErrors(state)).toBe(false);
    expect(
        getComposition(reducer(state, deleteCompositionArtifact()))
    ).toContain('bpmn2:definitions');
});
