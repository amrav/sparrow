/*
 * action types
 */

export const ADD_HUB = 'ADD_HUB';
export const CONNECTED_TO_HUB = 'CONNECTED_TO_HUB';
export const DISCONNECTED_FROM_HUB = 'DISCONNECTED_FROM_HUB';
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';
export const RECEIVE_PRIVATE_MESSAGE = 'RECEIVE_PRIVATE_MESSAGE';

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
