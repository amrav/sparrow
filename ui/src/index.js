import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import sparrowApp from './reducers';
import App from './components/App';
import { RECEIVE_MESSAGE, RECEIVE_PRIVATE_MESSAGE, NEW_TAB_MAYBE } from './actions';
import configureStore from './redux/configureStore';

const initialState = {
    hubs: {},
    messages: {
        hubMessages: [{
            from: 'foobar',
            text: 'Hello, world'
        }],
        privateMessages: {}
    },
    searches: {}
};

const store = configureStore(initialState);

const socket = new WebSocket('ws://127.0.0.1:12345/connect');
socket.onmessage = (event) => {
    let msg = JSON.parse(event.data);
    if (msg.type === RECEIVE_MESSAGE) {
        store.dispatch({
            type: NEW_TAB_MAYBE,
            tabType: 'hubMessages',
            key: '',
            name: 'Hub'
        });
    } else if (msg.type === RECEIVE_PRIVATE_MESSAGE) {
        store.dispatch({
            type: NEW_TAB_MAYBE,
            tabType: 'privateMessages',
            key: msg.from,
            name: msg.from
        });
    }
    store.dispatch(msg);
};

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
