/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import axios from 'axios';
import Configuration from 'config/Configuration';
import catalog from 'features/catalog/catalogApi';
import activities from 'features/activities/activitiesApi';
import version from 'features/version/versionApi';
import overview from 'features/workflow/overview/overviewApi';
import create from 'features/workflow/create/createWorkflowApi';

jest.mock('axios', () => jest.fn());
jest.mock('wfapp/store', () => ({ dispatch: jest.fn() }));

beforeEach(() => {
    Configuration.set('restPrefix', '/api');
    Configuration.set('activitiesRestPrefix', '/activities');
    axios.mockImplementation(config =>
        Promise.resolve({ data: { id: 'result' }, config, headers: {} })
    );
});

it('encodes catalog filters and repeated sort parameters without losing pagination', async () => {
    await catalog.getWorkflows({
        sort: { name: 'asc', modificationTime: 'desc' },
        limit: 20,
        offset: 40,
        searchNameFilter: 'A & B',
        status: 'ACTIVE'
    });
    expect(axios.mock.calls[0][0].url).toBe(
        '/api/workflows?sort=name%3Aasc&sort=modificationTime%3Adesc&limit=20&offset=40&archiving=ACTIVE&searchNameFilter=A%20%26%20B'
    );
});

it('omits an empty search instead of filtering for an empty name', async () => {
    await catalog.getWorkflows({
        sort: {},
        limit: 20,
        offset: 0,
        searchNameFilter: '',
        status: 'ALL'
    });
    expect(axios.mock.calls[0][0].url).toBe(
        '/api/workflows?limit=20&offset=0&archiving=ALL'
    );
});

[
    [
        'certified activities',
        () => activities.fetchActivities(),
        'GET',
        '/activities/activity-spec?status=Certified',
        {}
    ],
    [
        'latest activity',
        () => activities.fetchActivity('a1'),
        'GET',
        '/activities/activity-spec/a1/versions/latest',
        {}
    ],
    [
        'workflow',
        () => overview.getWorkflow('w1'),
        'GET',
        '/api/workflows/w1',
        {}
    ],
    [
        'versions',
        () => overview.getVersions('w1'),
        'GET',
        '/api/workflows/w1/versions',
        {}
    ],
    [
        'workflow update',
        () =>
            overview.updateWorkflow({
                id: 'w1',
                name: 'Workflow',
                description: 'Description',
                ignored: true
            }),
        'PUT',
        '/api/workflows/w1',
        { name: 'Workflow', description: 'Description' }
    ],
    [
        'archive',
        () => overview.archiveRestoreWorkflow({ id: 'w1', type: 'ARCHIVED' }),
        'POST',
        '/api/workflows/w1/archiving',
        { status: 'ARCHIVED' }
    ],
    [
        'create workflow',
        () => create.createNewWorkflow({ name: 'Workflow' }),
        'POST',
        '/api/workflows/',
        { name: 'Workflow' }
    ],
    [
        'version',
        () => version.fetchVersion({ workflowId: 'w1', versionId: 'v1' }),
        'GET',
        '/api/workflows/w1/versions/v1',
        {}
    ],
    [
        'first version',
        () =>
            version.createNewVersion({
                workflowId: 'w1',
                description: 'First'
            }),
        'POST',
        '/api/workflows/w1/versions',
        { description: 'First' }
    ],
    [
        'branch version',
        () =>
            version.createNewVersion({
                workflowId: 'w1',
                baseId: 'v1',
                description: 'Branch'
            }),
        'POST',
        '/api/workflows/w1/versions?baseVersionId=v1',
        { description: 'Branch' }
    ],
    [
        'update version',
        () =>
            version.updateVersion({
                workflowId: 'w1',
                params: { id: 'v1', description: 'Updated' }
            }),
        'PUT',
        '/api/workflows/w1/versions/v1',
        { id: 'v1', description: 'Updated' }
    ],
    [
        'fetch artifact',
        () =>
            version.fetchVersionArtifact({ workflowId: 'w1', versionId: 'v1' }),
        'GET',
        '/api/workflows/w1/versions/v1/artifact',
        {}
    ],
    [
        'delete artifact',
        () =>
            version.deleteVersionArtifact({
                workflowId: 'w1',
                versionId: 'v1'
            }),
        'DELETE',
        '/api/workflows/w1/versions/v1/artifact',
        {}
    ],
    [
        'certify version',
        () => version.certifyVersion({ workflowId: 'w1', versionId: 'v1' }),
        'POST',
        '/api/workflows/w1/versions/v1/state',
        { name: 'CERTIFIED' }
    ]
].forEach(([name, request, method, url, data]) => {
    it(`uses the backend contract for ${name}`, async () => {
        expect(await request()).toEqual({ id: 'result' });
        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({ method, url, data })
        );
    });
});

it('uploads XML using a named BPMN multipart file', async () => {
    await version.updateVersionArtifact({
        workflowId: 'w1',
        versionId: 'v1',
        workflowName: 'Install',
        versionName: '1_0',
        payload: '<bpmn/>'
    });
    const request = axios.mock.calls[0][0];
    expect(request.url).toBe('/api/workflows/w1/versions/v1/artifact');
    expect(request.method).toBe('PUT');
    const file = request.data.get('fileToUpload');
    expect(file.name).toBe('Install-1_0.bpmn');
    expect(file.type).toBe('text/xml');
    expect(file.size).toBe(7);
});
