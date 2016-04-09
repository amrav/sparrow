/*
 * action types
 */

export const ADD_HUB = 'ADD_HUB';
export const CONNECTED_TO_HUB = 'CONNECTED_TO_HUB';
export const DISCONNECTED_FROM_HUB = 'DISCONNECTED_FROM_HUB';
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';
export const RECEIVE_PRIVATE_MESSAGE = 'RECEIVE_PRIVATE_MESSAGE';
export const NEW_SEARCH = 'NEW_SEARCH';
export const RECEIVE_SEARCH_RESULT = 'RECEIVE_SEARCH_RESULT';
export const NEW_TAB = 'NEW_TAB';
export const NEW_TAB_MAYBE = 'NEW_TAB_MAYBE';
export const FOCUS_TAB = 'FOCUS_TAB';
export const SELECT_TAB = 'SELECT_TAB';

/*
 * action creators
 */

export function addHub(hubIp) {
    return { type: CONNECTED_TO_HUB, hubIp };
}

export function connectedToHub(hubIp) {
    return { type: CONNECTED_TO_HUB, hubIp };
}

export function disconnectedFromHub(hubIp) {
    return { type: DISCONNECTED_FROM_HUB, hubIp };
}

export function receiveMessage(msg) {
    return { type: RECEIVE_MESSAGE, msg };
}

export function receivePrivateMessage(msg) {
    return {...msg, type: RECEIVE_PRIVATE_MESSAGE};
}

export function newSearch(searchText) {
    return {type: NEW_SEARCH, searchText};
}

export function fetchSearchResults(searchText) {
    return (dispatch, getState) => {
        dispatch(newSearch(searchText));
        console.log('state: ', getState());
        let ws = getState().socket;
        console.log(ws.send);
        ws.send(JSON.stringify({
            type: 'MAKE_SEARCH_QUERY',
            searchText
        }));
    };
}

export function receiveSearchResults(results) {
    return {type: RECEIVE_SEARCH_RESULT, results};
}

export function newTab(name, type, key) {
    return {
        type: NEW_TAB,
        name: name,
        tabType: type,
        key: key
    };
}

export function newTabMaybe(name, type, key) {
    return {...newTab(name, type, key), type: NEW_TAB_MAYBE};
}

export function focusTab(type, key) {
    return {type: FOCUS_TAB, tabType: type, key: key};
}

export function selectTab(index) {
    return {type: SELECT_TAB, index};
}
