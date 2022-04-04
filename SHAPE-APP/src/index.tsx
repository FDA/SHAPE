import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";
import AppContainer from "./AppContainer";
import * as serviceWorker from "./serviceWorker";
import configureStore from "./redux/store/configureStore";
import { Provider } from "react-redux";
import { firebase } from "./config";
import { createFirestoreInstance } from "redux-firestore";
import { ReactReduxFirebaseProvider } from "react-redux-firebase";

const storeBag = configureStore({});
const { store } = storeBag;
const rrfProps = {
  firebase,
  config: {
    userProfile: "users",
    useFirestoreForProfile: true,
  },
  dispatch: store.dispatch,
};

ReactDOM.render(
  <Provider store={store}>
    <ReactReduxFirebaseProvider
      {...rrfProps}
      createFirestoreInstance={createFirestoreInstance}
    >
      <BrowserRouter>
        <Route component={AppContainer} />
      </BrowserRouter>
    </ReactReduxFirebaseProvider>
  </Provider>,

  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
