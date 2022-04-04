import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/functions';

import firebaseConfig from './firebase.json';

try {
    firebase.initializeApp(firebaseConfig);
    firebase.firestore();
} catch (err) {
    console.error('Error Initializing Firebase');
}

export const functions = firebase.functions();
export default firebase;
