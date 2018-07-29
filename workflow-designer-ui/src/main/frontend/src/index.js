/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http: //www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import Notifications from 'shared/notifications/Notifications';
import Loader from 'shared/loader/Loader';
import App from 'wfapp/App';
import ModalWrapper from 'shared/modal/ModalWrapper';
import store from './store';

ReactDOM.render(
    <Provider store={store}>
        <React.Fragment>
            <Notifications />
            <Loader />
            <BrowserRouter>
                <React.Fragment>
                    <div className="workflow-app">
                        <App />
                    </div>
                    <ModalWrapper />
                </React.Fragment>
            </BrowserRouter>
        </React.Fragment>
    </Provider>,
    document.getElementById('root')
);
