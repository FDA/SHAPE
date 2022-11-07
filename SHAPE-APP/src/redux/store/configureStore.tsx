import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";
import logger from "../middlewares/logger";
import appReducer from "../reducers";
import { getFirebase } from "react-redux-firebase";
import { persistReducer, persistStore } from "redux-persist";
import localForage from "localforage";
import { encryptTransform } from "redux-persist-transform-encrypt";

//@ts-ignore
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
//@ts-ignore
import reduxReset from "redux-reset";

export default function configureStore(initialState: any) {
   // Apply the middleware to the store
   localForage.setDriver([localForage.INDEXEDDB, localForage.LOCALSTORAGE]);
   const persistConfig = {
      key: "root",
      storage: localForage,
      blacklist: ["firebase", "firestore", "applicationReady", "history"],
      stateReconciler: autoMergeLevel2,
      transforms: [
         encryptTransform({
            //Store the secret key in an encrypted location
            secretKey: "",
            onError: function (error) {
               console.error(error);
            },
         }),
      ],
   };

   const rootReducer = (state: any, action: any) => {
      // when a logout action is dispatched it will reset redux state
      if (action.type === "USERS_LOGOUT") {
         state = undefined;
      }
      return appReducer(state, action);
   };

   const persistedReducer = persistReducer(persistConfig, rootReducer);

   const store = createStore(
      persistedReducer,
      initialState,
      compose(
         applyMiddleware(logger, thunk.withExtraArgument(getFirebase)), // storeEnhancer
         //@ts-ignore
         //window.devToolsExtension ? window.devToolsExtension() : (f) => f, // storeEnhancer
         window.__REDUX_DEVTOOLS_EXTENSION__
            ? //@ts-ignore
              window.__REDUX_DEVTOOLS_EXTENSION__()
            : (f) => f,
         reduxReset()
      )
   );
   const persistor = persistStore(store);
   return { store, persistor };
}
// Dump store state in Chrome browser
//$r.store.getState()
