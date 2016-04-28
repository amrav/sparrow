import { combineReducers } from 'redux';
import * as actions from '../actions';
import { reducer as formReducer } from 'redux-form';
import newSocket from '../socket';
import immutable, { fromJS } from 'immutable';
import { profiler } from '../instrumentation';

const initialMessagesState = fromJS({
    hubMessages: [],
    privateMessages: {}
});

const socket = (state = newSocket) => {
    return state;
};

const messages = (state = initialMessagesState, action) => {
    switch(action.type) {
    case actions.RECEIVE_MESSAGE:
        return state.updateIn(['hubMessages'], msgs => msgs.push({
            from: action.from,
            text: action.text,
            time: Date.now()
        }));
    case actions.RECEIVE_PRIVATE_MESSAGE: {
        let newState = state;
        if (!state.hasIn(['privateMessages', action.from])) {
            newState = state.setIn(['privateMessages', action.from], fromJS([]));
        }
        return newState.updateIn(['privateMessages', action.from], msgs => msgs.push({
            from: action.from,
            text: action.text,
            time: Date.now()
        }));
    }
    default:
        return state;
    }
};

const matchSearchWithFilename = (searchTerms, fileName) => {
    for (let st of searchTerms) {
        if (fileName.indexOf(st) === -1) {
            return false;
        }
    }
    return true;
};

const searches = (state = fromJS({}), action) => {
    switch(action.type) {
    case actions.NEW_SEARCH:
        return state.setIn([action.searchText, 'results'], new immutable.Set());
    case actions.RECEIVE_SEARCH_RESULT: {
        let timer = profiler.start('searches');
        let newState = state;
        newState.keySeq().map(st => {
            const terms = st.split(" ");
            // Push TTH into results of each search text, if not
            // already present
            const res = newState.getIn([st, 'results']).withMutations(res => {
                for (let act of action.actions) {
                    if (!matchSearchWithFilename(terms, act.name))
                        continue;
                    if (!res.contains(act.tth)) {
                        res.add(act.tth);
                    }
                }
            });
            newState = newState.setIn([st, 'results'], res);
        }).cacheResult(); // force evaluation
        timer.stop('searches');
        return newState;
    }
    default:
        return state;
    }
};

// TODO: Convert tabs to use Immutable fully
const tabs = (state = fromJS({tabList: []}), action) => {
    switch(action.type) {
    case actions.NEW_TAB_MAYBE: {
        let tabExists = state.get('tabList').find(
            t => t.get('type') === action.tabType && t.get('key') === action.key
        );
        if (tabExists) {
            return state;
        }
    } // fallthrough
    case actions.NEW_TAB:
        return state.update('tabList', l => l.push(fromJS({
            name: action.name,
            type: action.tabType,
            key:  action.key
        })));
    case actions.FOCUS_TAB:
        return state.set('focused', {
            type: action.tabType,
            key: action.key
        });
    case actions.SELECT_TAB: {
        const tab = state.getIn(['tabList', action.index]);
        return state.set('focused', tab);
    }
    default:
        return state;
    }
};

// Similar to fromJS, but also converts JS Sets to Immutable Sets
const fromJSToFileImmutable = (js) => {
    return typeof js !== 'object' || js === null? js:
        Array.isArray(js) ?
        immutable.Seq(js).map(fromJSToFileImmutable).toList():
        js instanceof Set ?
        immutable.Seq(js).map(fromJSToFileImmutable).toSet():
        immutable.Seq(js).map(fromJSToFileImmutable).toMap();
};

// Files are indexed by TTH, and are further indexed by user,
// since there are instances of a file owned by different users,
// possibly with different names, and in different file paths.
const files = (state = fromJS({}), action) => {
    switch(action.type) {
    case actions.RECEIVE_SEARCH_RESULT: {
        let timer = profiler.start('files');
        let newState = {};
        action.actions.map(act => {
            if (!newState.hasOwnProperty(act.tth)) {
                newState[act.tth] = {users: {}, size: act.size};
            }
            if (!newState[act.tth].users.hasOwnProperty(act.username)) {
                newState[act.tth].users[act.username] = new Set();
            }
            newState[act.tth].users[act.username].add(act.name);
        });

        if (state.size === 0) {
            timer.stop();
            return fromJSToFileImmutable(newState);
        }

        // TODO: Figure out why merge is so much slower than fromJS, and fix
        newState = state.withMutations(state => {

            for (let tth in newState) {

                if (!state.has(tth)) {
                    state.set(tth, fromJS({users: {}, size: newState[tth].size}));
                }
                let users = state.getIn([tth, 'users']).withMutations(users => {
                    for (let user in newState[tth].users) {
                        if (!users.has(user)) {
                            users.set(user, new immutable.Set());
                        }
                        let files = users.get(user).withMutations(files => {
                            files.union(newState[tth].users[user]);
                        });
                        users.set(user, files);
                    }
                });
                state.setIn([tth, 'users'], users);
            }
        });
        // newState = state.mergeDeep(fromJSToFileImmutable(newState));
        // console.log('Returning new state: ', newState);
        timer.stop();
        return newState;
/*            act.tth,
            (o = fromJS({users: {}, size: act.size})) => o
        ).updateIn(
            [act.tth, 'users', act.username],
            (files = fromJS([])) => files.contains(act.name) ?
                files : files.push(act.name)
        ));

        return newState;*/
    }
    default:
        return state;
    }
};

const users = (state = fromJS({}), action) => {
    switch(action.type) {
    case actions.RECEIVE_SEARCH_RESULT: {
        let timer = profiler.start('users');
        // console.log('users reducer started');
        let newState = state;
        let users = {};
        action.actions.map(act => {
            users[act.username] = {
                freeSlots: act.freeSlots,
                totalSlots: act.totalSlots
            };
        });
        if (state.size === 0) {
            timer.stop();
            return fromJS(users);
        } else {
            newState = state.merge(users);
            timer.stop();
            return newState;
        }
    }
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
