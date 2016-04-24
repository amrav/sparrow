import { combineReducers } from 'redux';
import * as actions from '../actions';
import { reducer as formReducer } from 'redux-form';
import newSocket from '../socket';
import { fromJS } from 'immutable';
import { profiler } from '../instrumentation';

const initialHubState = fromJS({
    connected: false
});

const initialMessagesState = fromJS({
    hubMessages: [],
    privateMessages: {},
    activeTabs: []
});

/*const hubs = (state = initialHubState, action) => {
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
};*/

const socket = (state = newSocket, action) => {
    return state;
};

const messages = (state = initialMessagesState, action) => {
    switch(action.type) {
    case actions.RECEIVE_MESSAGE:
        return state.updateIn(['hubMessages'], msgs => msgs.push({
            from: action.from,
            text: action.text
        }));
    case actions.RECEIVE_PRIVATE_MESSAGE:
        let newState = state;
        if (!state.hasIn(['privateMessages', action.from])) {
            newState = state.setIn(['privateMessages', action.from], fromJS([]));
        }
        return newState.updateIn(['privateMessages', action.from], msgs => msgs.push({
            from: action.from,
            text: action.text
        }));
    default:
        return state;
    }
};

const searches = (state = fromJS({}), action) => {
    switch(action.type) {
    case actions.NEW_SEARCH:
        return state.set(action.searchText, fromJS({results: []}));
    case actions.RECEIVE_SEARCH_RESULT:
        let timer = profiler.start('searches');
        let newState = state;
        for (let act of action.actions) {
            newState.keySeq().filter(
                // sequence of all search texts that would match search result
                st => act.name.toLowerCase().indexOf(st.toLowerCase()) !== -1
            ).map(st => {
                // Push TTH into results of each search text, if not
                // already present
                newState = newState.updateIn(
                    [st, 'results'],
                    res => res.contains(act.tth)? res : res.push(act.tth)
                );
            }).cacheResult(); // force evaluation
        }
        timer.stop('searches');
        return newState;
    default:
        return state;
    }
};

const tabs = (state = fromJS({tabList: []}), action) => {
    switch(action.type) {
    case actions.NEW_TAB_MAYBE:
        let tabList = state.get('tabList');
        let tabExists = state.get('tabList').find(
            ({type, key}) => type === action.tabType && key === action.key
        );
        if (tabExists) {
            return state;
        }
        // fallthrough
    case actions.NEW_TAB:
        return state.update('tabList', l => l.push({
            name: action.name,
            type: action.tabType,
            key:  action.key
        }));
    case actions.FOCUS_TAB:
        return state.set('focused', {
            type: action.tabType,
            key: action.key
        });
    case actions.SELECT_TAB:
        const tab = state.getIn(['tabList', action.index]);
        return state.set('focused', tab);
    default:
        return state;
    }
};

// Files are indexed by TTH, and have an array of UserFiles,
// which are instances of a file owned by different users,
// possibly with different names, and in different file paths.

const files = (state = fromJS({}), action) => {
    switch(action.type) {
    case actions.RECEIVE_SEARCH_RESULT:
        let timer = profiler.start('files');
        let newState = state;
        action.actions.map(act => newState = newState.update(
            act.tth,
            (o = fromJS({users: {}, size: act.size})) => o
        ).updateIn(
            [act.tth, 'users', act.username],
            (files = fromJS([])) => files.contains(act.name) ?
                files : files.push(act.name)
        ));
        timer.stop();
        return newState;
    default:
        return state;
    }
};

const users = (state = fromJS({}), action) => {
    switch(action.type) {
    case actions.RECEIVE_SEARCH_RESULT:
        let timer = profiler.start('users');
        // console.log('users reducer started');
        let newState = state;
        action.actions.map(act => newState = newState.update(
            act.username,
            (user = fromJS({})) => user
                .set('freeSlots', act.freeSlots)
                .set('totalSlots', act.totalSlots)
        ));
        timer.stop();
        return newState;
    default:
        return state;
    }
};

const rootReducer = combineReducers({
//    hubs,
    messages,
    form: formReducer,
    searches,
    tabs,
    socket,
    files,
    users
});

export default rootReducer;
