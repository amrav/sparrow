import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import sparrowApp from './reducers';
import App from './components/App';

const store = (window.devToolsExtension ?
             window.devToolsExtension()(createStore) :
             createStore)(sparrowApp);

const socket = new WebSocket('http://127.0.0.1:12345/connect');
socket.onmessage = (event) => {
    console.log(event.data);
};

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
