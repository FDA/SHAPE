import { CallbackFunction } from "../interfaces/components";
const firebase = require('firebase');
const firebaseConfig = require('../../src/firebase-connect.json');

export class AuthService {
    public async get(body: any, callback: CallbackFunction) {
        const {username, password} = body;
        var app = firebase.initializeApp(firebaseConfig);
        firebase.auth().signInWithEmailAndPassword(username, password).then(() => {
            firebase.auth().currentUser.getIdToken(true).then(async (userToken: any) => {
                await firebase.auth().signOut()
                await app.delete()
                callback(false, {"userToken": userToken});
            }).catch(async (error: any) => {
                console.error("error caught in getIdToken: " + error)
                await firebase.auth().signOut()
                await app.delete()
                callback(true, error);
            });
        }).catch(async (error: any) => {
            console.error("error caught in signInWithEmailAndPassword: " + error)
            await firebase.auth().signOut()
            await app.delete()
            callback(true, error);
        })
    }
}

