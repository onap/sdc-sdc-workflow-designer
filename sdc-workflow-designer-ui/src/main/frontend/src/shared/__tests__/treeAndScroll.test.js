/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import React from 'react';
import { mount } from 'enzyme';
import Tree from 'shared/tree/Tree';
import InfiniteScroll from 'shared/scroll/InfiniteScroll';

// jsdom 11 cannot match SVG classes with its class-selector fast path.
// Keep real D3 rendering, translating only the equivalent root SVG selector.
jest.mock('d3-selection', () => {
    const d3 = require.requireActual('d3-selection');
    return {
        ...d3,
        select: selector =>
            d3.select(
                typeof selector === 'string'
                    ? selector.replace(/svg\.([\w-]+)/g, 'svg[class~="$1"]')
                    : selector
            )
    };
});

let host;
let wrapper;
beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
});
afterEach(() => {
    if (wrapper) wrapper.unmount();
    wrapper = undefined;
    host.remove();
});
const geometry = (node, properties) =>
    Object.keys(properties).forEach(key =>
        Object.defineProperty(node, key, {
            configurable: true,
            value: properties[key]
        })
    );
const nodes = [
    { id: 'root', name: '1.0' },
    { id: 'b', name: '1.2', parent: 'root' },
    { id: 'a', name: '1.1', parent: 'root' }
];

it('renders real version tree links in name order and reports the clicked version', () => {
    const onNodeClick = jest.fn();
    wrapper = mount(
        <Tree
            name="versions"
            nodes={nodes}
            selectedNodeId="a"
            onNodeClick={onNodeClick}
            scrollable
        />,
        { attachTo: host }
    );
    expect(
        Array.from(host.querySelectorAll('[class~="node"] text')).map(
            node => node.textContent
        )
    ).toEqual(['1.0', '1.1', '1.2']);
    expect(host.querySelectorAll('[class~="link"]')).toHaveLength(2);
    expect(host.querySelector('[class~="selectedNode"]').textContent).toBe(
        '1.1'
    );
    host.querySelector('[class~="selectedNode"]').dispatchEvent(
        new MouseEvent('click', { bubbles: true })
    );
    expect(onNodeClick).toHaveBeenCalledWith({
        id: 'a',
        name: '1.1',
        parent: 'root'
    });
    wrapper.setProps({ selectedNodeId: 'b' });
    expect(host.querySelector('[class~="selectedNode"]').textContent).toBe(
        '1.2'
    );
    wrapper.setProps({
        nodes: [...nodes, { id: 'c', name: '2.0', parent: 'root' }]
    });
    expect(host.querySelectorAll('[class~="node"]')).toHaveLength(4);
});

it('scales wide trees, signals overflow and can keep a fixed width', () => {
    const onRenderedBeyondWidth = jest.fn();
    wrapper = mount(
        <Tree
            name="wide-tree"
            nodes={nodes}
            width={20}
            toWiden
            onRenderedBeyondWidth={onRenderedBeyondWidth}
        />,
        { attachTo: host }
    );
    expect(
        Number(host.querySelector('svg').getAttribute('width'))
    ).toBeGreaterThan(20);
    expect(onRenderedBeyondWidth).toHaveBeenCalledTimes(1);
    wrapper.setProps({
        selectedNodeId: 'b',
        allowScaleWidth: false,
        onRenderedBeyondWidth: undefined,
        onNodeClick: undefined
    });
    expect(host.querySelector('svg').getAttribute('width')).toBe('20');
    host.querySelector('[class~="node"]').dispatchEvent(
        new MouseEvent('click', { bubbles: true })
    );
    wrapper.setProps({ selectedNodeId: 'missing', nodes: [] });
    expect(host.querySelector('svg')).not.toBeNull();
});

it('renders an empty tree without SVG nodes', () => {
    wrapper = mount(<Tree nodes={[]} />, { attachTo: host });
    expect(host.querySelectorAll('[class~="node"]')).toHaveLength(0);
    wrapper.setProps({ width: 200 });
    expect(host.querySelector('svg').getAttribute('width')).toBe('200');
});

it('loads a parent-scrolled list once near its end and reattaches after new results', () => {
    const loadMore = jest.fn();
    wrapper = mount(
        <InfiniteScroll useWindow={false} hasMore loadMore={loadMore}>
            <p>Results</p>
        </InfiniteScroll>,
        { attachTo: host }
    );
    const element = wrapper.getDOMNode();
    geometry(element, { scrollHeight: 1000, offsetParent: host });
    geometry(host, { clientHeight: 300, scrollTop: 0 });
    host.dispatchEvent(new Event('scroll'));
    expect(loadMore).not.toHaveBeenCalled();
    geometry(host, { scrollTop: 600 });
    host.dispatchEvent(new Event('scroll'));
    expect(loadMore).toHaveBeenCalledTimes(1);
    host.dispatchEvent(new Event('scroll'));
    expect(loadMore).toHaveBeenCalledTimes(1);
    wrapper.setProps({ hasMore: true });
    expect(loadMore).toHaveBeenCalledTimes(2);
    wrapper.unmount();
    wrapper = undefined;
    host.dispatchEvent(new Event('scroll'));
    expect(loadMore).toHaveBeenCalledTimes(2);
});

it('uses window scrolling geometry and does not load a hidden list', () => {
    const loadMore = jest.fn();
    wrapper = mount(
        <InfiniteScroll hasMore loadMore={loadMore}>
            <p>Results</p>
        </InfiniteScroll>,
        { attachTo: host }
    );
    const element = wrapper.getDOMNode();
    geometry(host, { offsetTop: 20, offsetParent: null });
    geometry(element, { offsetHeight: 100, offsetTop: 10, offsetParent: null });
    window.dispatchEvent(new Event('scroll'));
    expect(loadMore).not.toHaveBeenCalled();
    geometry(element, { offsetParent: host });
    window.dispatchEvent(new Event('scroll'));
    expect(loadMore).toHaveBeenCalledTimes(1);
});

it('does not subscribe when there are no more pages', () => {
    const loadMore = jest.fn();
    wrapper = mount(
        <InfiniteScroll hasMore={false} loadMore={loadMore}>
            <p>Finished</p>
        </InfiniteScroll>,
        { attachTo: host }
    );
    geometry(wrapper.getDOMNode(), {
        offsetParent: host,
        offsetHeight: 10,
        offsetTop: 0
    });
    window.dispatchEvent(new Event('resize'));
    expect(loadMore).not.toHaveBeenCalled();
});
