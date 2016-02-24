import Immutable from 'immutable';
import { combineReducers } from 'redux';
import { ADD_HUB, CONNECTED_TO_HUB, DISCONNECTED_FROM_HUB, RECEIVE_MESSAGE } from './actions';

const initialState = {
    hubs: {},
    messages: {
        hubMessages: [{
            from: 'foobar',
            text: 'Hello, world'
        }]
    }
};

const initialHubState = {
    connected: false
};
const initialMessagesState = {
    hub_messages: []
};

const hubs = (state = initialHubState, action) => {
    let newState, hub;
    switch (action.type) {
    case ADD_HUB:
        newState = {...state}
        newState[action.hubIp] = initialHubState;
        return newState;
    case CONNECTED_TO_HUB:
        hub = {...state[action.hubIp], connected: true};
        newState = {...state};
        newState[action.hubIp] = hub;
        return newState;
    case DISCONNECTED_FROM_HUB:
        hub = {...state[action.hubIp], connected: false};
        newState = {...state};
        newState[action.hubIp] = hub;
        return newState;
    default:
        return state;
    }
};

const messages = (state = initialMessagesState, action) => {
    console.log("Got message action: ", action);
    switch(action.type) {
    case RECEIVE_MESSAGE:
        let newMsgs = [...state.hubMessages, {
            from: action.from,
            text: action.text
        }];
        let newState = {...state, hubMessages: newMsgs};
        console.log("New state: ", newState);
        return newState;
    default:
        console.log("Returning default state");
        return state;
    }
};

const reducer = combineReducers({
    hubs,
    messages
});

const sparrowApp = (state, action) => {
    if (typeof state === 'undefined') {
        return initialState;
    } else {
        return reducer(state, action);
    }
};

export default sparrowApp;
