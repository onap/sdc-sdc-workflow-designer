/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import createTestStore, {
    flushPromises
} from '../../testSetup/createTestStore';
import rootSaga from '../rootSaga';
import versionApi from 'features/version/versionApi';
import activitiesApi from 'features/activities/activitiesApi';
import overviewApi from 'features/workflow/overview/overviewApi';
import createApi from 'features/workflow/create/createWorkflowApi';
import catalogApi from 'features/catalog/catalogApi';
import { workflowVersionFetchRequestedAction } from 'features/version/versionConstants';
import { submitWorkflowAction } from 'features/workflow/create/createWorkflowConstants';
import {
    archiveWorkflowAction,
    restoreWorkflowAction,
    getVersionsAction,
    updateWorkflowAction
} from 'features/workflow/overview/overviewConstansts';
import { getActivitiesList } from 'features/activities/activitiesActions';
import {
    fetchWorkflow,
    searchChangedAction
} from 'features/catalog/catalogActions';
import { SEARCH_BUFFER } from 'features/catalog/catalogConstants';
import { NETWORK_GENERIC_ERROR } from '../appConstants';
import { notificationActions } from 'shared/notifications/notificationsActions';

jest.mock('wfapp/store', () => ({ dispatch: jest.fn() }));
jest.mock('features/version/versionApi', () => ({
    fetchVersion: jest.fn(),
    fetchVersionArtifact: jest.fn(),
    createNewVersion: jest.fn()
}));
jest.mock('features/activities/activitiesApi', () => ({
    fetchActivities: jest.fn(),
    fetchActivity: jest.fn()
}));
jest.mock('features/workflow/overview/overviewApi', () => ({
    getVersions: jest.fn(),
    getWorkflow: jest.fn(),
    updateWorkflow: jest.fn(),
    archiveRestoreWorkflow: jest.fn()
}));
jest.mock('features/workflow/create/createWorkflowApi', () => ({
    createNewWorkflow: jest.fn()
}));
jest.mock('features/catalog/catalogApi', () => ({ getWorkflows: jest.fn() }));

let harness;
const errors = () =>
    harness.actions.filter(action => action.type === NETWORK_GENERIC_ERROR);

beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    activitiesApi.fetchActivities.mockResolvedValue({ items: [] });
    overviewApi.getVersions.mockResolvedValue({
        items: [{ id: 'v1', name: '1.0', state: 'DRAFT' }]
    });
    overviewApi.getWorkflow.mockResolvedValue({ id: 'w1', name: 'Workflow' });
    catalogApi.getWorkflows.mockResolvedValue({
        items: [],
        paging: { offset: 0, total: 0, hasMore: false }
    });
    harness = createTestStore(rootSaga);
});
afterEach(() => {
    harness.task.cancel();
    jest.useRealTimers();
});

it('initializes translations and loads the latest activity details in list order', async () => {
    activitiesApi.fetchActivities.mockResolvedValue({
        items: [{ id: 'a1' }, { id: 'a2' }]
    });
    activitiesApi.fetchActivity.mockImplementation(id =>
        Promise.resolve({ id, name: id === 'a1' ? 'Install' : 'Remove' })
    );
    harness.store.dispatch(getActivitiesList());
    await flushPromises();
    expect(harness.store.getState().i18n.locale).toBe('en');
    expect(harness.store.getState().activities).toEqual([
        { id: 'a1', name: 'Install' },
        { id: 'a2', name: 'Remove' }
    ]);
    expect(activitiesApi.fetchActivity.mock.calls).toEqual([['a1'], ['a2']]);
});

['list', 'details'].forEach(stage => {
    it(`retains existing activities if loading ${stage} fails`, async () => {
        harness.store.dispatch({
            type: 'activites/SET_ACTIVITIES_LIST',
            payload: [{ id: 'old' }]
        });
        activitiesApi.fetchActivities.mockResolvedValue({
            items: [{ id: 'a1' }]
        });
        const failure = { responseJSON: { message: 'Unavailable' } };
        (stage === 'list'
            ? activitiesApi.fetchActivities
            : activitiesApi.fetchActivity
        ).mockRejectedValue(failure);
        harness.store.dispatch(getActivitiesList());
        await flushPromises();
        expect(harness.store.getState().activities).toEqual([{ id: 'old' }]);
        expect(errors()).toEqual([
            { type: NETWORK_GENERIC_ERROR, payload: failure }
        ]);
    });
});

[false, true].forEach(hasArtifact => {
    it(`loads a version ${
        hasArtifact ? 'with' : 'without'
    } an artifact and replaces stale data`, async () => {
        harness.store.dispatch({
            type: 'composition/SET_COMPOSITION',
            payload: 'old'
        });
        versionApi.fetchVersion.mockResolvedValue({
            id: 'v1',
            name: '1.0',
            state: 'DRAFT',
            hasArtifact,
            inputs: [{ name: 'vm', type: 'STRING' }],
            outputs: []
        });
        versionApi.fetchVersionArtifact.mockResolvedValue('<diagram/>');
        harness.store.dispatch(
            workflowVersionFetchRequestedAction({
                workflowId: 'w1',
                versionId: 'v1'
            })
        );
        await flushPromises();
        const {
            general,
            composition,
            inputOutput
        } = harness.store.getState().currentVersion;
        expect(general).toEqual({
            id: 'v1',
            name: '1.0',
            state: 'DRAFT',
            hasArtifact
        });
        expect(inputOutput.inputs).toEqual([{ name: 'vm', type: 'STRING' }]);
        expect(composition.diagram).toContain(
            hasArtifact ? '<diagram/>' : 'bpmn2:definitions'
        );
        expect(versionApi.fetchVersionArtifact).toHaveBeenCalledTimes(
            hasArtifact ? 1 : 0
        );
        expect(errors()).toEqual([]);
    });
});

it('reports a version fetch failure without replacing the active version', async () => {
    versionApi.fetchVersion.mockRejectedValue({
        responseJSON: { message: 'Missing' }
    });
    harness.store.dispatch(
        workflowVersionFetchRequestedAction({
            workflowId: 'w1',
            versionId: 'v1'
        })
    );
    await flushPromises();
    expect(harness.store.getState().currentVersion.general).toEqual({
        isCompositionUpdating: false
    });
    expect(errors()).toHaveLength(1);
});

it('ignores a stale version request when navigation starts a newer one', async () => {
    let finishOld;
    versionApi.fetchVersion.mockImplementation(
        ({ versionId }) =>
            versionId === 'old'
                ? new Promise(resolve => {
                      finishOld = resolve;
                  })
                : Promise.resolve({ id: 'new', inputs: [], outputs: [] })
    );
    harness.store.dispatch(
        workflowVersionFetchRequestedAction({ versionId: 'old' })
    );
    harness.store.dispatch(
        workflowVersionFetchRequestedAction({ versionId: 'new' })
    );
    await flushPromises();
    finishOld({ id: 'old', inputs: [], outputs: [] });
    await flushPromises();
    expect(harness.store.getState().currentVersion.general.id).toBe('new');
});

it('creates a workflow, its initial version, closes the modal and navigates without errors', async () => {
    createApi.createNewWorkflow.mockResolvedValue({
        id: 'w1',
        name: 'Workflow'
    });
    versionApi.createNewVersion.mockResolvedValue({ id: 'v1' });
    const history = { push: jest.fn() };
    harness.store.dispatch(
        submitWorkflowAction({ name: 'Workflow', description: 'Test', history })
    );
    await flushPromises();
    expect(harness.store.getState().workflow.data).toEqual({
        id: 'w1',
        name: 'Workflow'
    });
    expect(harness.store.getState().workflow.versions).toEqual([
        { id: 'v1', name: '1.0', state: 'DRAFT' }
    ]);
    expect(history.push).toHaveBeenCalledWith(
        '/workflows/workflow/w1/version/v1'
    );
    expect(harness.actions.map(action => action.type)).toContain(
        'modal/HIDE_MODAL'
    );
    expect(errors()).toEqual([]);
});

it('does not call creation APIs for invalid names', async () => {
    harness.store.dispatch(submitWorkflowAction({ name: 'bad!' }));
    await flushPromises();
    expect(harness.store.getState().workflow.data.error).toBeTruthy();
    expect(createApi.createNewWorkflow).not.toHaveBeenCalled();
});

it('clears draft workflow data and reports creation failures', async () => {
    harness.store.dispatch({
        type: 'createWorkflow/INPUT_CHANGE',
        payload: { name: 'Unsaved' }
    });
    createApi.createNewWorkflow.mockRejectedValue({
        responseJSON: { message: 'Duplicate' }
    });
    harness.store.dispatch(submitWorkflowAction({ name: 'Workflow' }));
    await flushPromises();
    expect(harness.store.getState().workflow.data).toEqual({});
    expect(errors()).toHaveLength(1);
});

it('loads overview details and versions', async () => {
    harness.store.dispatch(getVersionsAction('w1'));
    await flushPromises();
    expect(harness.store.getState().workflow.data).toEqual({
        id: 'w1',
        name: 'Workflow'
    });
    expect(harness.store.getState().workflow.versions).toHaveLength(1);
});

it('reports an overview failure', async () => {
    overviewApi.getVersions.mockRejectedValue({ responseJSON: {} });
    harness.store.dispatch(getVersionsAction('w1'));
    await flushPromises();
    expect(errors()).toHaveLength(1);
    expect(overviewApi.getWorkflow).not.toHaveBeenCalled();
});

[false, true].forEach(fails => {
    it(`${
        fails ? 'reports a failed' : 'notifies a successful'
    } overview update`, async () => {
        if (fails)
            overviewApi.updateWorkflow.mockRejectedValue({ responseJSON: {} });
        harness.store.dispatch(
            updateWorkflowAction({ id: 'w1', description: 'Updated' })
        );
        await flushPromises();
        expect(errors()).toHaveLength(fails ? 1 : 0);
        expect(harness.store.getState().notifications).toHaveLength(
            fails ? 0 : 1
        );
    });
});

[false, true].forEach(fails => {
    it(`${
        fails
            ? 'keeps the workflow open on failed archive'
            : 'refreshes the catalog and navigates after archive'
    }`, async () => {
        if (fails)
            overviewApi.archiveRestoreWorkflow.mockRejectedValue({
                responseJSON: {}
            });
        const history = { push: jest.fn() };
        harness.store.dispatch(
            archiveWorkflowAction({ id: 'w1', name: 'Workflow', history })
        );
        await flushPromises();
        expect(errors()).toHaveLength(fails ? 1 : 0);
        expect(history.push).toHaveBeenCalledTimes(fails ? 0 : 1);
        expect(harness.store.getState().notifications).toHaveLength(
            fails ? 0 : 1
        );
        expect(catalogApi.getWorkflows).toHaveBeenCalledTimes(fails ? 0 : 1);
    });
});

it('restores a workflow and reloads its details', async () => {
    harness.store.dispatch(restoreWorkflowAction({ id: 'w1' }));
    await flushPromises();
    expect(overviewApi.archiveRestoreWorkflow).toHaveBeenCalledWith({
        id: 'w1',
        type: 'ACTIVE'
    });
    expect(harness.store.getState().workflow.data.id).toBe('w1');
});

it('debounces search and only fetches the newest filter', async () => {
    harness.store.dispatch(
        searchChangedAction({
            sort: { name: 'asc' },
            status: 'ACTIVE',
            searchNameFilter: 'old'
        })
    );
    harness.store.dispatch(
        searchChangedAction({
            sort: { name: 'asc' },
            status: 'ACTIVE',
            searchNameFilter: 'latest'
        })
    );
    jest.advanceTimersByTime(SEARCH_BUFFER - 1);
    expect(catalogApi.getWorkflows).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    await flushPromises();
    expect(catalogApi.getWorkflows).toHaveBeenCalledTimes(1);
    expect(catalogApi.getWorkflows).toHaveBeenCalledWith(
        expect.objectContaining({ searchNameFilter: 'latest', offset: 0 })
    );
});

it('keeps catalog results after a failed refresh', async () => {
    catalogApi.getWorkflows.mockRejectedValue({ responseJSON: {} });
    harness.store.dispatch(
        fetchWorkflow({ sort: { name: 'asc' }, status: 'ACTIVE' })
    );
    await flushPromises();
    expect(harness.store.getState().catalog.paging.total).toBe(0);
    expect(errors()).toEqual([]);
});

it('removes timed notifications after their timeout', async () => {
    harness.store.dispatch(
        notificationActions.showSuccess({ title: 'Saved', message: 'Done' })
    );
    expect(harness.store.getState().notifications).toHaveLength(1);
    jest.runOnlyPendingTimers();
    await flushPromises();
    expect(harness.store.getState().notifications).toEqual([]);
});

it('does not reload the overview after a failed restore', async () => {
    overviewApi.archiveRestoreWorkflow.mockRejectedValue({ responseJSON: {} });
    harness.store.dispatch(restoreWorkflowAction({ id: 'w1' }));
    await flushPromises();
    expect(overviewApi.getWorkflow).not.toHaveBeenCalled();
    expect(errors()).toHaveLength(1);
});

it('honors a notification-specific timeout', async () => {
    harness.store.dispatch(
        notificationActions.showInfo({
            title: 'Info',
            message: 'Temporary',
            timeout: 500
        })
    );
    jest.advanceTimersByTime(499);
    await flushPromises();
    expect(harness.store.getState().notifications).toHaveLength(1);
    jest.advanceTimersByTime(1);
    await flushPromises();
    expect(harness.store.getState().notifications).toEqual([]);
});
