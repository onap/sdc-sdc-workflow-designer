/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { ModalFooter, ModalHeader, ModalBody } from 'onap-ui-react';
import SearchInput from 'shared/searchInput/SearchInput';
import Description from 'shared/components/Description';
import Select from 'shared/components/Select';
import Navigation from 'shared/navigationSideBar';
import MenuItems from 'shared/navigationSideBar/NavigationMenuItems';
import ModalWrapper from 'shared/modal/ModalWrapper';
import ModalView from 'shared/modal/ModalWrapperView';
import {
    showAlertModalAction,
    showCustomModalAction,
    hideModalAction
} from 'shared/modal/modalWrapperActions';
import { NEW_WORKFLOW_MODAL } from 'shared/modal/modalWrapperComponents';
import Notifications from 'shared/notifications/Notifications';
import { Notification } from 'onap-ui-react';
import { notificationActions } from 'shared/notifications/notificationsActions';
import Loader from 'shared/loader/Loader';
import {
    sendRequestAction,
    recieveResponseAction
} from 'shared/loader/LoaderConstants';
import Scrollbars from 'shared/scroll/Scrollbars';
import createTestStore from '../../../testSetup/createTestStore';

const wrappers = [];
const render = element => {
    const wrapper = mount(element);
    wrappers.push(wrapper);
    return wrapper;
};
afterEach(() => {
    while (wrappers.length) wrappers.pop().unmount();
});

it('opens search from the keyboard, forwards text and clears on Escape', () => {
    const onChange = jest.fn();
    const wrapper = render(
        <SearchInput
            dataTestId="search"
            label="Find workflow"
            value=""
            onChange={onChange}
        />
    );
    wrapper
        .find('[role="button"]')
        .hostNodes()
        .simulate('keyDown', { key: 'Enter', preventDefault() {} });
    expect(wrapper.find('input').prop('aria-label')).toBe('Find workflow');
    wrapper.find('input').simulate('change', { target: { value: 'Install' } });
    expect(onChange).toHaveBeenLastCalledWith('Install');
    wrapper.setProps({ value: 'Install' });
    wrapper.find('input').simulate('blur');
    expect(wrapper.find('input')).toHaveLength(1);
    wrapper.find('input').simulate('keyDown', { key: 'Tab' });
    expect(onChange).toHaveBeenCalledTimes(1);
    wrapper
        .find('input')
        .simulate('keyDown', { key: 'Escape', preventDefault() {} });
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(wrapper.find('input')).toHaveLength(0);
});

it('closes empty search on blur and clears populated search with the clear control', () => {
    const onChange = jest.fn();
    const wrapper = render(
        <SearchInput dataTestId="s" value="" onChange={onChange} />
    );
    wrapper
        .find('[data-test-id="s"]')
        .hostNodes()
        .simulate('click');
    wrapper.find('input').simulate('blur');
    expect(wrapper.find('input')).toHaveLength(0);
    wrapper
        .find('[data-test-id="s"]')
        .hostNodes()
        .simulate('click');
    wrapper.setProps({ value: 'value' });
    wrapper
        .find('[data-test-id="s-close-search"]')
        .hostNodes()
        .simulate('keyDown', { key: ' ', preventDefault() {} });
    expect(onChange).toHaveBeenCalledWith('');
    expect(wrapper.find('input')).toHaveLength(0);
});

it('forwards description edits and exposes disabled form state', () => {
    const onDataChange = jest.fn();
    const wrapper = render(
        <Description description="Old" onDataChange={onDataChange} />
    );
    wrapper
        .find('textarea')
        .simulate('change', { target: { value: 'Updated' } });
    expect(onDataChange).toHaveBeenCalledWith({ description: 'Updated' });
    expect(wrapper.find('textarea').prop('data-test-id')).toBe('description');
    wrapper.setProps({ disabled: true, dataTestId: 'custom-description' });
    expect(wrapper.find('textarea').prop('disabled')).toBe(true);
    expect(wrapper.find('textarea').prop('data-test-id')).toBe(
        'custom-description'
    );
});

it('renders selected version choices using display names and supports an empty list', () => {
    const wrapper = render(
        <Select
            dataObj={[
                { id: 'v1', name: '1.0' },
                { id: 'v2', name: '2.0', displayed: 'Latest' }
            ]}
            selectedItemValue="v2"
            label="Version"
            disabled
        />
    );
    expect(wrapper.find('option').map(node => node.text())).toEqual([
        '1.0',
        'Latest'
    ]);
    expect(wrapper.find('select').getDOMNode().value).toBe('v2');
    expect(wrapper.find('select').prop('disabled')).toBe(true);
    wrapper.setProps({ dataObj: [], label: undefined });
    expect(wrapper.find('option')).toHaveLength(0);
    expect(wrapper.find('label')).toHaveLength(0);
});

it('selects a navigation item and calls its group and item callbacks', () => {
    const onSelect = jest.fn();
    const onToggle = jest.fn();
    const itemSelect = jest.fn();
    const item = {
        id: 'GENERAL|v1',
        name: 'General',
        onSelect: itemSelect,
        expanded: true
    };
    const groups = [
        {
            id: 'version',
            items: [
                item,
                { id: 'IO', name: 'Inputs', disabled: true, hidden: true }
            ]
        }
    ];
    const wrapper = render(
        <Navigation
            groups={groups}
            activeItemId={item.id}
            onSelect={onSelect}
            onToggle={onToggle}
            disabled
        />
    );
    expect(wrapper.find('.navigation-side-content.disabled')).toHaveLength(1);
    const link = wrapper.find('[data-test-id="navbar-group-item-GENERAL"]');
    expect(link.hasClass('selected')).toBe(true);
    link.simulate('click');
    expect(onToggle).toHaveBeenCalledWith(groups, 'GENERAL|v1');
    expect(itemSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(item);
    wrapper.setProps({ onSelect: undefined, onToggle: undefined });
    wrapper.find('[data-test-id="navbar-group-item-IO"]').simulate('click');
    expect(itemSelect).toHaveBeenCalledTimes(1);
    expect(shallow(<MenuItems />).children()).toHaveLength(0);
});

it('renders error modal contents, executes actions and closes through Redux', () => {
    const { store } = createTestStore();
    const actionButtonClick = jest.fn();
    store.dispatch(
        showAlertModalAction({
            title: 'Delete?',
            body: 'Confirm delete',
            withButtons: true,
            actionButtonText: 'Delete',
            closeButtonText: 'Cancel',
            actionButtonClick
        })
    );
    const wrapper = shallow(<ModalWrapper store={store} />).dive();
    expect(
        wrapper
            .find(ModalBody)
            .children()
            .text()
    ).toBe('Confirm delete');
    wrapper.find(ModalFooter).prop('actionButtonClick')();
    expect(actionButtonClick).toHaveBeenCalledTimes(1);
    wrapper.find(ModalHeader).prop('onClose')();
    expect(store.getState().modal).toEqual({});
    wrapper.unmount();
});

it('handles absent modals, optional close callbacks, and custom modal components', () => {
    const hideModal = jest.fn();
    const onClose = jest.fn();
    const wrapper = shallow(
        <ModalView hideModal={hideModal} onClose={onClose} />
    );
    expect(wrapper.isEmptyRender()).toBe(true);
    wrapper.setProps({
        modal: {
            type: 'custom',
            customComponentName: NEW_WORKFLOW_MODAL,
            customComponentProps: { marker: 'test' }
        }
    });
    expect(wrapper.find('[marker="test"]')).toHaveLength(1);
    expect(wrapper.find(ModalFooter)).toHaveLength(0);
    wrapper.find(ModalHeader).prop('onClose')();
    expect(hideModal).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    const { store } = createTestStore();
    store.dispatch(
        showCustomModalAction({ customComponentName: NEW_WORKFLOW_MODAL })
    );
    store.dispatch(hideModalAction());
    expect(store.getState().modal).toEqual({});
});

it('dismisses the selected notification without losing another one', () => {
    const { store } = createTestStore();
    store.dispatch(
        notificationActions.showWarning({ title: 'First', message: 'One' })
    );
    store.dispatch(
        notificationActions.showError({ title: 'Second', message: 'Two' })
    );
    const wrapper = shallow(<Notifications store={store} />).dive();
    const first = wrapper.find(Notification).at(0);
    expect(first.prop('title')).toBe('First');
    first.prop('onClick')();
    expect(store.getState().notifications.map(item => item.title)).toEqual([
        'Second'
    ]);
    wrapper.unmount();
});

it('keeps the loader visible until all overlapping requests complete', () => {
    const { store } = createTestStore();
    const wrapper = render(
        <Provider store={store}>
            <Loader />
        </Provider>
    );
    expect(wrapper.find('.tlv-loader')).toHaveLength(0);
    store.dispatch(sendRequestAction('/one'));
    store.dispatch(sendRequestAction('/two'));
    wrapper.update();
    expect(wrapper.find('.tlv-loader')).toHaveLength(1);
    store.dispatch(recieveResponseAction('/one'));
    wrapper.update();
    expect(wrapper.find('.tlv-loader')).toHaveLength(1);
    store.dispatch(recieveResponseAction('/two'));
    wrapper.update();
    expect(wrapper.find('.tlv-loader')).toHaveLength(0);
});

it('creates and destroys real scrollbar DOM when mounted, updated and unmounted', () => {
    const wrapper = render(
        <Scrollbars className="scroll-region">
            <p>One</p>
        </Scrollbars>
    );
    const element = wrapper.getDOMNode();
    expect(element.classList.contains('ps')).toBe(true);
    expect(element.querySelectorAll('.ps__rail-x')).toHaveLength(1);
    wrapper.setProps({ children: <p>Two</p> });
    expect(element.textContent).toContain('Two');
    wrapper.unmount();
    wrappers.pop();
    expect(element.classList.contains('ps')).toBe(false);
    expect(element.querySelectorAll('.ps__rail-x')).toHaveLength(0);
});
