import {applyMiddleware, compose, createStore} from 'redux';
import thunk from 'redux-thunk';
import logger from '../middlewares/logger';
import rootReducer from '../reducers';
import {getFirebase} from 'react-redux-firebase';

export default function configureStore(initialState) {
    // Apply the middleware to the store

    return createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(logger, thunk.withExtraArgument(getFirebase)), // storeEnhancer
            //window.devToolsExtension ? window.devToolsExtension() : (f) => f // storeEnhancer
            window.__REDUX_DEVTOOLS_EXTENSION__
                ? //@ts-ignore
                  window.__REDUX_DEVTOOLS_EXTENSION__()
                : (f) => f
        )
    );
}
// Dump store state in Chrome browser
//$r.store.getState()
