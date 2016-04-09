import { compose, createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers';
import thunk from 'redux-thunk';

export default function configureStore (initialState) {
    console.log(rootReducer);
    const store = createStore(rootReducer, initialState, compose(
        applyMiddleware(thunk),
        window.devToolsExtension ? window.devToolsExtension() : f => f
    ));

    /*if (module.onReload) {
        module.onReload(() => {
            const nextRootReducer = require('../reducers').default;
            store.replaceReducer(nextRootReducer);
            return true;
        });
    }*/
    return store;
}
