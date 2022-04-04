import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import configureStore from './redux/store/configureStore';
import {ReactReduxFirebaseProvider} from 'react-redux-firebase'
import {createFirestoreInstance} from "redux-firestore";
import {Provider} from "react-redux";
import {firebase} from './config';

const store = configureStore();

const rrfProps = {
    firebase,
    config: {
        userProfile: "users",
        useFirestoreForProfile: true

    },
    dispatch: store.dispatch,

};

ReactDOM.render(
    <Provider store={store}>
        <ReactReduxFirebaseProvider {...rrfProps} createFirestoreInstance={createFirestoreInstance}>
            <App/>
        </ReactReduxFirebaseProvider>
    </Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
