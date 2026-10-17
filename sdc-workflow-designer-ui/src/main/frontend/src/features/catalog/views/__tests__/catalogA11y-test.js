/*
 * Copyright (C) 2026 Deutsche Telekom AG.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { I18n } from 'react-redux-i18n';

import AddWorkflow from 'features/catalog/views/AddWorkflow';
import WorkflowTile from 'features/catalog/views/WorkflowTile';
import Main from 'features/catalog/views/Main';
import StatusSelect from 'features/catalog/views/StatusSelector';
import SearchInput from 'shared/searchInput/SearchInput';
import { ASC } from 'features/catalog/catalogConstants';

const key = k => ({ key: k, preventDefault: jest.fn() });

describe('Workflow catalog keyboard and screen-reader access', () => {
    beforeAll(() => {
        jest.spyOn(I18n, 't').mockImplementation(k => `t(${k})`);
    });

    it('opens the new-workflow dialog from the keyboard', () => {
        const onClick = jest.fn();
        const root = renderer.create(<AddWorkflow onClick={onClick} />).root;
        const tile = root.findByProps({
            'data-test-id': 'wf-catalog-add-workflow'
        });
        expect(tile.props.role).toBe('button');
        expect(tile.props.tabIndex).toBe(0);
        tile.props.onKeyDown(key('Enter'));
        tile.props.onKeyDown(key(' '));
        tile.props.onKeyDown(key('Tab'));
        expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('names a workflow tile by the workflow and hides its badges', () => {
        const onClick = jest.fn();
        const root = renderer.create(
            <WorkflowTile
                name="Workflow one"
                onClick={onClick}
                dataTestId="wf"
            />
        ).root;
        const tile = root.findByProps({ 'data-test-id': 'wf' });
        expect(tile.props.role).toBe('button');
        expect(tile.props['aria-label']).toBe('Workflow one');
        expect(
            root.findByProps({ className: 'sdc-tile-header blue' }).props[
                'aria-hidden'
            ]
        ).toBe('true');
        tile.props.onKeyDown(key('Enter'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('announces the sort direction and the result count', () => {
        const root = renderer.create(
            <Main
                total={3}
                alphabeticalOrder={ASC}
                onAlphabeticalOrderByClick={() => {}}
            />
        ).root;
        expect(
            root.findByProps({
                'data-test-id': 'wf-catalog-alphabetical-order'
            }).props['aria-label']
        ).toBe('t(catalog.alphabeticalOrderAscending)');
        expect(
            root.findByProps({ className: 'main__header__total' }).props.role
        ).toBe('status');
    });

    it('names the status filter and the search controls', () => {
        expect(
            renderer
                .create(<StatusSelect status="ACTIVE" onChange={() => {}} />)
                .root.findByType('select').props['aria-label']
        ).toBe('t(catalog.status)');
        const closed = renderer.create(
            <SearchInput
                dataTestId="s"
                label="Search workflows"
                onChange={() => {}}
                value=""
            />
        ).root;
        const icon = closed.findByProps({ 'data-test-id': 's' });
        expect(icon.props.role).toBe('button');
        expect(icon.props['aria-label']).toBe('Search workflows');
        const open = renderer.create(
            <SearchInput
                dataTestId="s"
                label="Search workflows"
                onChange={() => {}}
                value="x"
            />,
            { createNodeMock: () => ({ focus() {} }) }
        ).root;
        expect(open.findByType('input').props['aria-label']).toBe(
            'Search workflows'
        );
        expect(
            open.findByProps({ 'data-test-id': 's-close-search' }).props[
                'aria-label'
            ]
        ).toBe('t(buttons.clearSearchBtn)');
    });
});
