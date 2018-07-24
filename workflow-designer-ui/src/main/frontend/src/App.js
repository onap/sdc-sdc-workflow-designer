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
import { Route } from 'react-router-dom';

import 'resources/scss/style.scss';
import 'bpmn-js-properties-panel/styles/properties.less';
import { routes } from './routes';

const RouteWithSubRoutes = route => (
    <Route
        path={route.path}
        exact={route.exact}
        render={props => <route.component {...props} routes={route.routes} />}
    />
);

class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return routes.map((route, i) => (
            <RouteWithSubRoutes key={`App.route.${i}`} {...route} />
        ));
    }
}

export default hot(module)(App);
