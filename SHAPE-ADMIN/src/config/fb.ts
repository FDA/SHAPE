/* 
   currently must use firebase/compat/<package> where firebase interacts 
   with react-redux-firebase. This is due to latest version of
   react-redux-firebase not being compatible with firebase v9 modular imports.
   r-r-f will need to release new version before we can switch from compat to v9.

   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';
   import { getFunctions } from 'firebase/functions';    
*/

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/functions';

import firebaseConfig from './firebase.json';

try {
    firebase.initializeApp(firebaseConfig);
    firebase.firestore();
} catch (err) {
    console.error('Error Initializing Firebase');
}

export const functions = firebase.functions();
export default firebase;