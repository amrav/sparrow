import { combineReducers } from 'redux';
import { ADD_HUB, CONNECTED_TO_HUB, DISCONNECTED_FROM_HUB, RECEIVE_MESSAGE,
         RECEIVE_PRIVATE_MESSAGE } from '../actions';

const initialHubState = {
    connected: false
};
const initialMessagesState = {
    hubMessages: [],
    privateMessages: {},
    activeTabs: []
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
    let newState;
    switch(action.type) {
    case RECEIVE_MESSAGE:
        let newMsgs = [...state.hubMessages, {
            from: action.from,
            text: action.text
        }];
        newState = {...state, hubMessages: newMsgs};
        return newState;
    case RECEIVE_PRIVATE_MESSAGE:
        let newPrivateMessages = {...state.privateMessages};
        if (!state.privateMessages.hasOwnProperty(action.from)) {
            newPrivateMessages[action.from] = [];
        }
        newPrivateMessages[action.from] = [...newPrivateMessages[action.from], {
            from: action.from,
            text: action.text
        }];
        newState = {...state, privateMessages: newPrivateMessages};
        if (state.activeTabs.indexOf(action.from) === -1) {
            newState.activeTabs = [...state.activeTabs, action.from];
        }
        return newState;
    default:
        console.log("Returning default state");
        return state;
    }
};

const rootReducer = combineReducers({
    hubs,
    messages
});

export default rootReducer;
