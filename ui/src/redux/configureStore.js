import { compose, createStore } from 'redux';
import rootReducer from '../reducers';

export default function configureStore (initialState) {
    const store = createStore(rootReducer, initialState, compose(
        window.devToolsExtension ? window.devToolsExtension() : f => f
    ));

    if (module.onReload) {
        module.onReload(() => {
            const nextRootReducer = require('../reducers').default;
            store.replaceReducer(nextRootReducer);
            return true;
        });
    }
    return store;
}
