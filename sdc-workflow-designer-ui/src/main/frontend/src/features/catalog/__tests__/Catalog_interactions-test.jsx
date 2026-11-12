/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import Catalog from '../Catalog';
import InfiniteScroll from 'shared/scroll/InfiniteScroll';
import createTestStore from '../../../../testSetup/createTestStore';
import { updateWorkflow } from '../catalogActions';
import { FETCH_WORKFLOW, SEARCH_CHANGED } from '../catalogConstants';
import { setWorkflowAction } from 'features/workflow/workflowConstants';

function setup(status = 'ACTIVE', sort = 'asc') {
    const context = createTestStore();
    context.store.dispatch(setWorkflowAction({ id: 'old' }));
    context.store.dispatch(
        updateWorkflow({
            items: [{ id: 'wf1', name: 'Deploy network' }],
            paging: { offset: 0, total: 1, hasMore: true },
            sort: { name: sort },
            status,
            searchNameFilter: ''
        })
    );
    const history = { location: { pathname: '/workflows/' }, push: jest.fn() };
    const wrapper = mount(
        <Provider store={context.store}>
            <Catalog history={history} />
        </Provider>
    );
    return { ...context, wrapper, history };
}

describe('catalog interactions with Redux', () => {
    it('clears the previous workflow and fetches the active catalog on entry', () => {
        const { store, actions, wrapper } = setup();
        expect(store.getState().workflow.data).toEqual({});
        expect(actions.filter(a => a.type === FETCH_WORKFLOW)).toEqual([
            expect.objectContaining({
                payload: {
                    sort: { name: 'asc' },
                    limit: 31,
                    offset: undefined,
                    searchNameFilter: '',
                    status: 'ACTIVE'
                }
            })
        ]);
        expect(wrapper.find('.sdc-tile-info-line').text()).toBe(
            'Deploy network'
        );
        wrapper.find('.sdc-tile').simulate('click');
        wrapper.find('.add-workflow').simulate('click');
        expect(store.getState().modal).toMatchObject({
            customComponentName: 'NEW_WORKFLOW_MODAL',
            title: 'New Workflow'
        });
        wrapper.unmount();
    });

    it('navigates to a selected workflow and requests sorting, status and paging changes', () => {
        const { actions, wrapper, history } = setup();
        wrapper.find('.sdc-tile').simulate('click');
        expect(history.push).toHaveBeenCalledWith(
            '/workflows/workflow/wf1/overview'
        );
        wrapper
            .find('[data-test-id="wf-catalog-alphabetical-order"]')
            .simulate('click');
        expect(actions[actions.length - 1].payload.sort).toEqual({
            name: 'desc'
        });
        wrapper
            .find('select')
            .simulate('change', { target: { value: 'ARCHIVED' } });
        expect(actions[actions.length - 1].payload.status).toBe('ARCHIVED');
        wrapper.find(InfiniteScroll).prop('loadMore')();
        expect(actions[actions.length - 1].payload).toMatchObject({
            offset: 0,
            status: 'ACTIVE'
        });
        wrapper.unmount();
    });

    it('persists search text and hides workflow creation in the archived catalog', () => {
        const { actions, wrapper, store } = setup('ARCHIVED', 'desc');
        expect(wrapper.find('.add-workflow')).toHaveLength(0);
        wrapper
            .find('[data-test-id="wf-catalog-alphabetical-order"]')
            .simulate('click');
        expect(actions[actions.length - 1].payload.sort.name).toBe('asc');
        wrapper.find('ExpandableInput').prop('onChange')('network');
        wrapper.update();
        expect(store.getState().catalog.searchNameFilter).toBe('network');
        expect(sessionStorage.getItem('searchNameFilter')).toBe('network');
        expect(actions[actions.length - 1].type).toBe(SEARCH_CHANGED);
        wrapper.unmount();
    });
});
