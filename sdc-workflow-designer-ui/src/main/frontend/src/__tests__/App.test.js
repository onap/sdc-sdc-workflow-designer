/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter, Router } from 'react-router-dom';
import App from '../App';
import { PluginPubSub } from 'shared/pubsub/plugin-pubsub';
import createTestStore from '../../testSetup/createTestStore';

// Page contents and cross-window transport are tested in their own suites.
jest.mock(
    'features/catalog/Catalog',
    () =>
        function CatalogPage() {
            return <div>Catalog page</div>;
        }
);
jest.mock(
    'features/version/Version',
    () =>
        function VersionPage() {
            return <div>Composition page</div>;
        }
);
jest.mock('features/version/general/General', () => () => null);
jest.mock('features/workflow/overview/Overview', () => () => null);
jest.mock('features/version/inputOutput/InputOutput', () => () => null);
jest.mock('features/version/composition/Composition', () => () => null);
jest.mock('shared/pubsub/plugin-pubsub', () => ({
    PluginPubSub: jest.fn().mockImplementation(function() {
        this.notify = jest.fn();
    })
}));

let wrapper;
beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
});
afterEach(() => {
    if (wrapper) wrapper.unmount();
    wrapper = undefined;
    window.history.replaceState({}, '', '/');
});
const render = () => {
    const { store, actions } = createTestStore();
    wrapper = mount(
        <Provider store={store}>
            <MemoryRouter initialEntries={['/workflows']}>
                <App />
            </MemoryRouter>
        </Provider>
    );
    return { store, actions };
};

it('renders the catalog entry route without requiring plugin parameters', () => {
    render();
    expect(wrapper.find('main.workflow-app').text()).toBe('Catalog page');
    expect(localStorage.getItem('USER_ID')).toBeNull();
    expect(PluginPubSub).not.toHaveBeenCalled();
});

it('stores the SDC user and announces plugin readiness to its parent', () => {
    window.history.replaceState(
        {},
        '',
        '/?userId=designer&eventsClientId=client-1&parentUrl=https%3A%2F%2Fhost.example'
    );
    const { store } = render();
    expect(localStorage.getItem('USER_ID')).toBe('designer');
    expect(store.getState().pluginContext).toEqual({
        eventsClientId: 'client-1',
        parentUrl: 'https://host.example'
    });
    expect(PluginPubSub).toHaveBeenCalledWith(
        'client-1',
        'https://host.example'
    );
    expect(PluginPubSub.mock.instances[0].notify).toHaveBeenCalledWith('READY');
});

it('opens the requested workflow version in operation mode on the registered route', () => {
    window.history.replaceState({}, '', '/?workflowId=w1&versionId=v1');
    const { store, actions } = render();
    wrapper.update();
    expect(wrapper.find(Router).prop('history').location.pathname).toBe(
        '/workflows/workflow/w1/version/v1/composition'
    );
    expect(wrapper.find('main').text()).toBe('Composition page');
    expect(store.getState().currentVersion.operationMode).toBe(true);
    expect(actions).toContainEqual({
        type: 'overview/GET_OVERVIEW',
        payload: 'w1'
    });
});

it('requires both workflow and version IDs before navigating', () => {
    window.history.replaceState(
        {},
        '',
        '/?workflowId=w1&eventsClientId=client-1'
    );
    const { store } = render();
    expect(wrapper.find(Router).prop('history').location.pathname).toBe(
        '/workflows'
    );
    expect(store.getState().currentVersion.operationMode).toBe(false);
    expect(PluginPubSub).not.toHaveBeenCalled();
});
