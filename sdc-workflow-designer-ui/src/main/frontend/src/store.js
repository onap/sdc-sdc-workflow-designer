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

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { syncTranslationWithStore } from 'react-redux-i18n';

import reducers from './rootReducers';
import rootSaga from './rootSaga';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const sagaMiddleware = createSagaMiddleware();

const middleware = [thunk, sagaMiddleware];

const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(...middleware))
);

const rootSagaTask = sagaMiddleware.run(rootSaga);
syncTranslationWithStore(store);

rootSagaTask.done.catch(function(err) {
    console.log(err);
});

export default store;
