import { combineReducers } from 'redux';
import * as actions from '../actions';
import { reducer as formReducer } from 'redux-form';
import newSocket from '../socket';

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
    case actions.ADD_HUB:
        newState = {...state}
        newState[action.hubIp] = initialHubState;
        return newState;
    case actions.CONNECTED_TO_HUB:
        hub = {...state[action.hubIp], connected: true};
        newState = {...state};
        newState[action.hubIp] = hub;
        return newState;
    case actions.DISCONNECTED_FROM_HUB:
        hub = {...state[action.hubIp], connected: false};
        newState = {...state};
        newState[action.hubIp] = hub;
        return newState;
    default:
        return state;
    }
};

const socket = (state = newSocket, action) => {
    switch(action.type) {
    case '@@redux/INIT':
        return socket;
    default:
        return state;
    }
};

const messages = (state = initialMessagesState, action) => {
    let newState;
    switch(action.type) {
    case actions.RECEIVE_MESSAGE:
        let newMsgs = [...state.hubMessages, {
            from: action.from,
            text: action.text
        }];
        newState = {...state, hubMessages: newMsgs};
        return newState;
    case actions.RECEIVE_PRIVATE_MESSAGE:
        let newPrivateMessages = {...state.privateMessages};
        if (!state.privateMessages.hasOwnProperty(action.from)) {
            newPrivateMessages[action.from] = [];
        }
        newPrivateMessages[action.from] = [...newPrivateMessages[action.from], {
            from: action.from,
            text: action.text
        }];
        newState = {...state, privateMessages: newPrivateMessages};
        return newState;
    default:
        return state;
    }
};

const searches = (state = {}, action) => {
    let newState;
    switch(action.type) {
    case actions.NEW_SEARCH:
        newState = {...state};
        newState[action.searchText] = {
            results: []
        };
        return newState;
    case actions.RECEIVE_SEARCH_RESULT:
        newState = {...state};
        for (let searchText of Object.keys(newState)) {
            if (action.name.indexOf(searchText) != -1) {
                if (newState[searchText].results.indexOf(action.tth) == -1) {
                    var newResults = [...newState[searchText].results, action.tth];
                    newState[searchText] = {
                        ...newState[searchText],
                        results: newResults
                    };
                }
            }
        }
        return newState;
    default:
        return state;
    }
};

const tabs = (state = {tabList: []}, action) => {
    let newState;
    switch(action.type) {
    case actions.NEW_TAB_MAYBE:
        for (var i = 0; i < state.tabList.length; i++) {
            const { type, key } = state.tabList[i];
            if (type === action.tabType && key === action.key) {
                return state;
            }
        }
        // fallthrough
    case actions.NEW_TAB:
        let newTabList = [...state.tabList, {
            name: action.name,
            type: action.tabType,
            key:  action.key
        }];
        let newState = {...state, tabList: newTabList};
        if (!newState.focused) {
            newState.focused = {
                type: action.tabType,
                key: action.key
            };
        }
        return newState;
    case actions.FOCUS_TAB:
        return {...state, focused: {
            type: action.tabType,
            key: action.key
        }};
    case actions.SELECT_TAB:
        const tab = state.tabList[action.index];
        return {...state, focused: {
            type: tab.type,
            key: tab.key
        }};
    default:
        return state;
    }
};

/*const searchResults = (state = {}, action) => {
    let newState;
    switch(action.type) {
    case actions.RECEIVE_SEARCH_RESULT:
    }
};*/

// Files are indexed by TTH, and have an array of UserFiles,
// which are instances of a file owned by different users,
// possibly with different names, and in different file paths.
const files = (state = {}, action) => {
    switch(action.type) {
    case actions.RECEIVE_SEARCH_RESULT:
        let newState = {...state};
        let newTth;
        if (!newState.hasOwnProperty(action.tth)) {
            newTth = {users: [], size: action.size};
        } else {
            newTth = {...newState[action.tth]};
        }
        if (newTth.users.indexOf(action.username) == -1) {
            newTth.users = [...newTth.users, action.username];
        }
        newState[action.tth] = newTth;
        return newState;
    default:
        return state;
    }
};

const rootReducer = combineReducers({
    hubs,
    messages,
    form: formReducer,
    searches,
    tabs,
    socket,
    files
});

export default rootReducer;
