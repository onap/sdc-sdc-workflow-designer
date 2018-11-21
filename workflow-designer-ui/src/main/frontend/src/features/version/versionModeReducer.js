import { SET_OPERRATION_MODE } from './versionConstants';

export default (state = false, action) => {
    switch (action.type) {
        case SET_OPERRATION_MODE:
            return true;
        default:
            return state;
    }
};
