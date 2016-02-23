import Immutable from 'immutable';
import { combineReducers } from 'redux';
import { ADD_HUB, CONNECTED_TO_HUB, DISCONNECTED_FROM_HUB, RECEIVE_MESSAGE } from './actions';

const initialState = Immutable.fromJS({
    hubs: {},
    messages: {
        hub_messages: [{
            from: 'foobar',
            text: 'Hello, world'
        }]
    }
});

const initialHubState = Immutable.Map({
    connected: false
});

const hubs = (state = initialHubState, action) => {
    switch (action.type) {
    case ADD_HUB:
        return state.set(action.hubIp, initialHubState);
    case CONNECTED_TO_HUB:
        return state.setIn([action.hubIp, 'connected'], true);
    case DISCONNECTED_FROM_HUB:
        return state.setIn([action.hubIp, 'connected'], false);
    default:
        return state;
    }
};

const reducer = combineReducers({
    hubs
});

const sparrowApp = (state, action) => {
    if (typeof state === 'undefined') {
        return initialState;
    } else {
        return reducer(state, action);
    }
};

export default sparrowApp;
