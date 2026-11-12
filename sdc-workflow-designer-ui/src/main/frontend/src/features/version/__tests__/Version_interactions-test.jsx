/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router-dom';
import createHistory from 'history/createMemoryHistory';
import Version from '../Version';
import VersionView from '../VersionView';
import createTestStore from '../../../../testSetup/createTestStore';
import {
    FETCH_REQUESTED,
    setOperationModeAction,
    setWorkflowVersionAction
} from '../versionConstants';
import { setWorkflowAction } from 'features/workflow/workflowConstants';
import { versionListFetchAction } from 'features/workflow/overview/overviewConstansts';

jest.mock('features/version/composition/CompositionUpdate', () => () => null);
const routes = [
    {
        id: 'general',
        path: '/',
        i18nName: 'workflow.general.name',
        exact: true,
        component: function GeneralRoute() {
            return <div className="general-route">General details</div>;
        }
    },
    {
        id: 'io',
        path: '/input-output',
        name: 'Inputs and outputs',
        component: function InputOutputRoute() {
            return <div className="io-route">Parameters</div>;
        }
    },
    {
        id: 'disabled',
        path: '/disabled',
        name: 'Unavailable',
        disabled: true,
        component: () => null
    }
];
function setup(path = '/workflows/workflow/wf1/version/v1') {
    const context = createTestStore();
    context.store.dispatch(setWorkflowAction({ id: 'wf1', name: 'Network' }));
    context.store.dispatch(
        setWorkflowVersionAction({ id: 'v1', state: 'draft' })
    );
    context.store.dispatch(
        versionListFetchAction({
            items: [{ id: 'v1', name: '1', state: 'DRAFT' }]
        })
    );
    const history = createHistory({ initialEntries: [path] });
    const wrapper = mount(
        <Provider store={context.store}>
            <Router history={history}>
                <Route
                    path="/workflows/workflow/:workflowId/version/:versionId"
                    render={routerProps => (
                        <Version {...routerProps} routes={routes} />
                    )}
                />
            </Router>
        </Provider>
    );
    return { ...context, wrapper, history };
}

it('loads route IDs, selects matching navigation and routes enabled links', () => {
    const { wrapper, actions, history } = setup();
    expect(actions).toContainEqual({
        type: FETCH_REQUESTED,
        payload: { workflowId: 'wf1', versionId: 'v1' }
    });
    expect(wrapper.find('.general-route').text()).toBe('General details');
    expect(
        wrapper
            .find('[data-test-id="navbar-group-item-general"]')
            .hasClass('selected')
    ).toBe(true);
    wrapper
        .find('[data-test-id="navbar-group-item-disabled"]')
        .simulate('click');
    expect(history.location.pathname).toBe(
        '/workflows/workflow/wf1/version/v1'
    );
    wrapper.find('[data-test-id="navbar-group-item-io"]').simulate('click');
    expect(history.location.pathname).toBe(
        '/workflows/workflow/wf1/version/v1/input-output'
    );
    wrapper.update();
    expect(wrapper.find('.io-route').text()).toBe('Parameters');
    wrapper
        .find('[data-test-id="navbar-group-item-general"]')
        .simulate('click');
    expect(history.location.pathname).toBe(
        '/workflows/workflow/wf1/version/v1'
    );
    wrapper.unmount();
});

it('handles unmatched paths and hides navigation in operation mode', () => {
    const { wrapper, store } = setup(
        '/workflows/workflow/wf1/version/v1/unknown'
    );
    expect(
        wrapper
            .find(VersionView)
            .instance()
            .getActiveItemIdProps()
    ).toBeUndefined();
    store.dispatch(setOperationModeAction(true));
    wrapper.update();
    expect(wrapper.find('.workflow-navigation-side-bar')).toHaveLength(0);
    expect(wrapper.find('.workflow-view')).toHaveLength(0);
    expect(wrapper.find('OperationModeButtons')).toHaveLength(1);
    wrapper.unmount();
});
