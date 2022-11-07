import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/functions";
import "firebase/compat/analytics";
import firebaseConfig from "./firebase.json";
import { environments } from "../utils/Constants";
import { isPlatform } from "@ionic/react";
import {
  initializeAuth,
  browserLocalPersistence
} from "firebase/auth";


try {
    const app = firebase.initializeApp(firebaseConfig);

    if (isPlatform('capacitor')) {
        initializeAuth(app, {
            persistence: browserLocalPersistence
        });
    }

    firebase.firestore();
    firebase.firestore().settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        merge: true // <- merge with base settings instead of full overwrite
    });
    firebase
        .firestore()
        .enablePersistence({synchronizeTabs: true})
        .catch((err: any) => {
            if (err.code === 'failed-precondition') {
                // Multiple tabs open, persistence can only be enabled
                // in one tab at a a time.
                console.error(err);
            } else if (err.code === 'unimplemented') {
                // The current browser does not support all of the
                // features required to enable persistence
                console.error(err);
            }
        });
    // Uncomment this log level to provide very verbose logging of FB
    //
    // firebase.setLogLevel("debug");
    if (process.env.NODE_ENV === environments.DEVELOPMENT)
        console.log(`Firebase App: ${firebase.app().name} Initialized`);
} catch (err) {
    console.error('Error Initializing Firebase');
}
export const functions = firebase.functions();
export const auth = firebase.auth();
export const analytics = firebase.analytics();
export default firebase;
