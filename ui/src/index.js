import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import sparrowApp from './reducers';
import App from './components/App';
import { RECEIVE_MESSAGE } from './actions';

const store = (window.devToolsExtension ?
             window.devToolsExtension()(createStore) :
             createStore)(sparrowApp);

const socket = new WebSocket('ws://127.0.0.1:12345/connect');
socket.onmessage = (event) => {
    let msg = JSON.parse(event.data);
    store.dispatch({...msg, type: RECEIVE_MESSAGE});
};

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
