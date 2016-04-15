import { store } from './index';
import { newTabMaybe } from './actions';
import { RECEIVE_MESSAGE, RECEIVE_PRIVATE_MESSAGE } from './actions';

const newSocket = () => {
    const socket = new WebSocket('ws://127.0.0.1:12345/connect');
    socket.onmessage = (event) => {
        let msg = JSON.parse(event.data);
        if (msg.type === RECEIVE_MESSAGE) {
            store.dispatch(newTabMaybe('Hub', 'hubMessages', ''));
        } else if (msg.type === RECEIVE_PRIVATE_MESSAGE) {
            store.dispatch(newTabMaybe(msg.from, 'privateMessages', msg.from));
        }
        setImmediate(store.dispatch, msg);
    };
    return socket;
};

export default newSocket();
