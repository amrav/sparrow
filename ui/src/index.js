import 'babel-polyfill';
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

export const store = configureStore(initialState);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
