import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import sparrowApp from './reducers';
import App from './components/App';
import configureStore from './redux/configureStore';

const initialState = {
    hubs: {},
    searches: {}
};

export const store = configureStore(initialState);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
