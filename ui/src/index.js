import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import sparrowApp from './reducers';
import App from './components/App';
import { RECEIVE_MESSAGE } from './actions';
import configureStore from './redux/configureStore';

const initialState = {
    hubs: {},
    messages: {
        hubMessages: [{
            from: 'foobar',
            text: 'Hello, world'
        }],
        privateMessages: {},
        activeTabs: ['hubMessages']
    }
};

const store = configureStore(initialState);

const socket = new WebSocket('ws://127.0.0.1:12345/connect');
socket.onmessage = (event) => {
    let msg = JSON.parse(event.data);
    store.dispatch(msg);
};

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
