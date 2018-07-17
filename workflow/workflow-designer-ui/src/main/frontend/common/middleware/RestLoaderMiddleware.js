import { restActions } from 'common/rest/RestConstants.js';
import { actionTypes } from 'common/shared-components/loader/LoaderConstants.js';

let fetchingRequests = 0;
const loader = store => next => action => {
    let startLoad = false;
    let stopLoad = false;

    switch (action.type) {
        case restActions.API_SENT:
            startLoad = fetchingRequests++ === 0;
            break;
        case restActions.API_RECEIVED:
            stopLoad = --fetchingRequests === 0;
            break;
        case restActions.API_FAILED:
            fetchingRequests = 0;
            stopLoad = true;
            break;
        default:
            break;
    }

    if (startLoad) {
        store.dispatch({
            type: actionTypes.SHOW
        });
    } else if (stopLoad) {
        store.dispatch({
            type: actionTypes.HIDE
        });
    }
    next(action);
};

export default loader;
