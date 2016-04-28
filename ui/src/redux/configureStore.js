import { compose, createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers';
import thunk from 'redux-thunk';
import { batchedSubscribe } from 'redux-batched-subscribe';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
// import { batchedUpdates } from 'redux-batched-updates';

export default function configureStore (initialState) {
    console.log(rootReducer);
    const store = createStore(rootReducer, initialState, compose(
        applyMiddleware(thunk),
        // window.devToolsExtension ? window.devToolsExtension() : f => f
        batchedSubscribe(batchedUpdates)
    ));

    if (module.onReload) {
        module.onReload(() => {
            const nextReducer = require('../reducers');
            store.replaceReducer(nextReducer.default || nextReducer);
            return true;
        });
    }
    return store;
}
