const logger = store => next => action => {
    console.log('Logger --> dispatching', action);
    let result = next(action);
    console.log('Logger --> next state', store.getState());
    return result;
};

export default logger;
