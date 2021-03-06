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

import { hot } from 'react-hot-loader';
import React, { Component } from 'react';
import { Route, withRouter } from 'react-router-dom';
import qs from 'qs';
import { connect } from 'react-redux';
import { PluginPubSub } from 'shared/pubsub/plugin-pubsub';
import 'resources/scss/style.scss';
import 'bpmn-js-properties-panel/styles/properties.less';
import { routes } from 'wfapp/routes';
import { USER_ID } from 'wfapp/appConstants';
import { getVersionsAction } from 'features/workflow/overview/overviewConstansts';
import { setOperationModeAction } from 'features/version/versionConstants';
import { setPluginContext } from './pluginContext/pluginContextActions';
import { notificationType } from 'wfapp/pluginContext/pluginContextConstants';
const RouteWithSubRoutes = route => (
    <Route
        path={route.path}
        exact={route.exact}
        render={props => <route.component {...props} routes={route.routes} />}
    />
);

function mapActionsToProps(dispatch) {
    return {
        getOverview: workflowId => {
            dispatch(getVersionsAction(workflowId));
            dispatch(setOperationModeAction());
        },
        setPluginContext: payload => dispatch(setPluginContext(payload))
    };
}

class App extends Component {
    constructor(props) {
        super(props);

        this.searchParams = qs.parse(location.search, {
            ignoreQueryPrefix: true
        });

        if (this.searchParams && this.searchParams.userId) {
            localStorage.setItem(USER_ID, this.searchParams.userId);
        }
    }

    componentDidMount() {
        if (this.searchParams) {
            const {
                eventsClientId,
                parentUrl,
                workflowId,
                versionId
            } = this.searchParams;

            if (eventsClientId && parentUrl) {
                this.props.setPluginContext({
                    eventsClientId,
                    parentUrl
                });
                const client = new PluginPubSub(eventsClientId, parentUrl);
                client.notify(notificationType.READY);
            }
            if (workflowId && versionId) {
                this.props.getOverview(workflowId);
                this.props.history.push(
                    `/workflow/${workflowId}/version/${versionId}/composition`
                );
            }
        }
    }

    render() {
        return (
            <div className="workflow-app">
                {routes.map((route, i) => (
                    <RouteWithSubRoutes key={`App.route.${i}`} {...route} />
                ))}
            </div>
        );
    }
}

export default hot(module)(
    withRouter(
        connect(
            null,
            mapActionsToProps
        )(App)
    )
);
