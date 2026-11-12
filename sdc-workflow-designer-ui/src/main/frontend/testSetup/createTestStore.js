/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import reducer from '../src/rootReducers';

// A fresh real Redux store for each test; callers cancel the returned task.
export default function createTestStore(saga) {
    const actions = [];
    const record = () => next => action => {
        actions.push(action);
        return next(action);
    };
    const middleware = createSagaMiddleware();
    const store = createStore(
        reducer,
        applyMiddleware(thunk, record, middleware)
    );
    const task = saga && middleware.run(saga);
    return { store, actions, task };
}

// Drain promise-based APIs without waiting for wall-clock timers.
export const flushPromises = () =>
    new Promise(resolve => setImmediate(resolve));
