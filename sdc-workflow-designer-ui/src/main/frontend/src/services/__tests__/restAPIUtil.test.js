/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import axios from 'axios';
import rest from '../restAPIUtil';
import store from 'wfapp/store';
import Configuration from 'config/Configuration';
import loader from 'shared/loader/LoaderReducer';

jest.mock('axios', () => jest.fn());
jest.mock('wfapp/store', () => ({ dispatch: jest.fn() }));

beforeEach(() => {
    localStorage.clear();
    Configuration.set('CatalogApiHeaders', undefined);
    axios.mockImplementation(config =>
        Promise.resolve({ data: { id: 'w1' }, headers: {}, config })
    );
});

it('sends identity and security headers while preserving caller headers', async () => {
    localStorage.setItem('USER_ID', 'designer');
    localStorage.setItem('sdc-auth-token', 'token-1');
    Configuration.setCatalogApiHeaders({
        userId: { name: 'X-Catalog-User', value: 'catalog-user' }
    });
    expect(
        await rest.fetch('/workflows', {
            headers: { Accept: 'application/json' }
        })
    ).toEqual({ id: 'w1' });
    expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: '/workflows',
        data: {},
        headers: {
            Accept: 'application/json',
            USER_ID: 'designer',
            'X-AUTH-TOKEN': 'token-1',
            'X-Catalog-User': 'catalog-user',
            'X-ECOMP-RequestID': expect.any(String)
        }
    });
    const actions = store.dispatch.mock.calls.map(call => call[0]);
    expect(actions.map(action => action.type)).toEqual([
        'loader/SEND_REQUEST',
        'loader/RECEIVE_RESPONSE'
    ]);
    expect(actions.reduce(loader, undefined).isLoading).toBe(false);
});

it('keeps anonymous requests free of stored identity', async () => {
    localStorage.setItem('sdc-auth-token', 'private');
    localStorage.setItem('USER_ID', 'designer');
    await rest.fetch('/public', { isAnonymous: true });
    expect(axios.mock.calls[0][0].headers).toEqual({});
});

[
    ['get', 'GET', {}],
    ['post', 'POST', { name: 'New' }],
    ['put', 'PUT', { name: 'Updated' }],
    ['delete', 'DELETE', {}],
    ['patch', 'PATCH', {}]
].forEach(([method, verb, data]) => {
    it(`uses ${verb} for ${method} requests and retains the payload`, async () => {
        await rest[method](
            '/resource',
            ...(verb === 'POST' || verb === 'PUT' ? [data] : [])
        );
        expect(axios.mock.calls[0][0]).toEqual(
            expect.objectContaining({ method: verb, url: '/resource', data })
        );
    });
});

it('adds the API checksum when requested', async () => {
    await rest.post('/resource', {}, { md5: true });
    // md5('{}') = 99914b932bd37a50b983c5e7c90ae93b, encoded as base64 text.
    expect(axios.mock.calls[0][0].headers['Content-MD5']).toBe(
        'OTk5MTRiOTMyYmQzN2E1MGI5ODNjNWU3YzkwYWU5M2I='
    );
});

[
    ['new-token', 'new-token'],
    ['null', null],
    ['token-1', 'token-1'],
    [undefined, 'token-1']
].forEach(([responseToken, expectedToken]) => {
    it(`handles response auth token ${responseToken}`, async () => {
        localStorage.setItem('sdc-auth-token', 'token-1');
        axios.mockImplementation(config =>
            Promise.resolve({
                data: {},
                headers: { 'X-AUTH-TOKEN': responseToken },
                config
            })
        );
        await rest.fetch('/resource');
        expect(localStorage.getItem('sdc-auth-token')).toBe(expectedToken);
    });
});

it('returns binary content as a blob with response headers', async () => {
    axios.mockImplementation(config =>
        Promise.resolve({
            data: new Uint8Array([1, 2, 3]),
            headers: { 'content-type': 'application/octet-stream' },
            config
        })
    );
    const result = await rest.fetch('/download', { dataType: 'binary' });
    expect(axios.mock.calls[0][0].responseType).toBe('arraybuffer');
    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.blob.size).toBe(3);
    expect(result.headers).toEqual({
        'content-type': 'application/octet-stream'
    });
});

it('rejects HTTP failures with the backend error and clears the loader', async () => {
    axios.mockRejectedValue({
        response: {
            status: 409,
            statusText: 'Conflict',
            data: { message: 'Name exists' }
        }
    });
    await expect(rest.post('/resource', {})).rejects.toEqual({
        responseJSON: { message: 'Name exists' }
    });
    const actions = store.dispatch.mock.calls.map(call => call[0]);
    expect(actions[1]).toEqual({
        type: 'loader/RECEIVE_RESPONSE',
        url: '/resource'
    });
    expect(actions[2]).toEqual({
        type: 'modal/SHOW_MODAL',
        payload: {
            type: 'error',
            size: 'small',
            title: 'Conflict',
            body: 'Name exists',
            withButtons: true,
            closeButtonText: 'Ok'
        }
    });
});

it('reports connection failures without replacing the error with a TypeError', async () => {
    axios.mockRejectedValue(new Error('Network Error'));
    await expect(rest.fetch('/offline')).rejects.toEqual({
        responseJSON: { message: 'Network Error' }
    });
    expect(store.dispatch).toHaveBeenLastCalledWith(
        expect.objectContaining({
            payload: expect.objectContaining({ body: 'Network Error' })
        })
    );
});

it('uses a stable fallback when a connection failure has no message', async () => {
    axios.mockRejectedValue({});
    await expect(rest.fetch('/offline')).rejects.toEqual({
        responseJSON: { message: 'Network Error' }
    });
});

it('shows a generic modal for HTTP errors without a response body', async () => {
    axios.mockRejectedValue({ response: { statusText: 'Unavailable' } });
    await expect(rest.fetch('/resource')).rejects.toEqual({
        responseJSON: undefined
    });
    expect(store.dispatch).toHaveBeenLastCalledWith(
        expect.objectContaining({
            payload: expect.objectContaining({
                title: 'Unavailable',
                body: 'GENERIC ERROR'
            })
        })
    );
});
