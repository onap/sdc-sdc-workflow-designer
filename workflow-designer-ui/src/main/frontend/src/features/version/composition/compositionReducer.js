import { SET_COMPOSITION } from './compositionConstants';

export default (state = null, action) => {
    switch (action.type) {
        case SET_COMPOSITION:
            return action.payload;
        default:
            return state;
    }
};
