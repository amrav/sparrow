import { store } from './index';
import { newTabMaybe, focusTab } from './actions';
import { RECEIVE_MESSAGE, RECEIVE_PRIVATE_MESSAGE } from './actions';
import { profiler } from './instrumentation';
import Perf from 'react-addons-perf';

const dispatchMessage = (msg) => {
    // let timer = profiler.start('dispatchMessage');
    Perf.start();
    if (msg.type === RECEIVE_MESSAGE) {
        store.dispatch(newTabMaybe('Hub', 'hubMessages', ''));
    } else if (msg.type === RECEIVE_PRIVATE_MESSAGE) {
        store.dispatch(newTabMaybe(msg.from, 'privateMessages', msg.from));
    }
    store.dispatch(msg);
    Perf.stop();
    const measurements = Perf.getLastMeasurements();
    // Perf.printInclusive(measurements);
    Perf.printExclusive(measurements);
    Perf.printWasted(measurements);
    // timer.stop('dispatchMessage');
};

const newSocket = () => {
    const socket = new WebSocket('ws://127.0.0.1:12345/connect');
    socket.onmessage = (event) => {
        let msg = JSON.parse(event.data);
        if (msg instanceof Array) {
            console.log(Date.now(), ': Got batched messages:', msg.length);
            let newMsg = {
                type: msg[0].type,
                actions: msg
            };
            dispatchMessage(newMsg);
            console.log(Date.now(), ': Finished dispatching messages in this batch');
            profiler.print();
            profiler.reset();
        } else {
            dispatchMessage(msg);
        }
    };
    return socket;
};

export default newSocket();
