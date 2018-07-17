/*
* Copyright © 2018 European Support Limited
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
import PropTypes from 'prop-types';
import { Route, matchPath } from 'react-router-dom';

import NavigationSideBar from 'common/shared-components/panel/NavigationSideBar';
import VersionController from './versionController/VersionController';

class VersionView extends React.Component {
    componentDidMount() {
        const { loadSelectedVersion, match } = this.props;
        const workflowId = match.params.workflowId;
        const versionId = match.params.versionId;
        loadSelectedVersion({ workflowId, versionId });
    }

    onSelect = item => {
        const { history, match } = this.props;

        if (!item.disabled) {
            history.push(
                item.path === '/' ? match.url : `${match.url}${item.path}`
            );
        }
    };

    getActiveItemIdProps = () => {
        const { location, routes, match } = this.props;

        const activeItem = routes.find(route =>
            matchPath(location.pathname, {
                path: `${match.path}${route.path}`,
                exact: true,
                strict: false
            })
        );

        return activeItem && activeItem.id;
    };

    render() {
        const { match, routes, history } = this.props;
        const groups = [
            {
                id: 'WORKFLOW',
                items: routes
            }
        ];

        const activeItemId = this.getActiveItemIdProps();
        return [
            <VersionController
                history={history}
                match={match}
                key="versionControllerView"
            />,
            <div className="workflow-view" key="workflowView">
                <div className="workflow-navigation-side-bar">
                    <NavigationSideBar
                        groups={groups}
                        activeItemId={activeItemId}
                        onSelect={this.onSelect}
                    />
                </div>
                {routes.map((route, i) => (
                    <Route
                        key={`Version.route.${i}`}
                        exact={route.exact}
                        path={`${match.url}${route.path}`}
                        component={route.component}
                    />
                ))}
            </div>
        ];
    }
}

VersionView.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
    routes: PropTypes.array,
    loadSelectedVersion: PropTypes.func
};

export default VersionView;
