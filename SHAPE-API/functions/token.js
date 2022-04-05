// This module returns a valid bearer token for a given username and password.
// This module is for testing purposes only.

const firebase = require('firebase');
const firebaseConfig = require('./firebase-connect.json');

firebase.initializeApp(firebaseConfig);

firebase.auth().signInWithEmailAndPassword('username', 'password').then(user => {
    firebase.auth().currentUser.getIdToken(true).then((token) => {
        console.log(`Retrieved token successfully for user ${user.user.email} uid: ${user.user.uid} claims: ${token.claims}`)
        console.log("/--------- start token ---------------/")
        console.log(token);
        console.log("/--------- end token ---------------/")
    }).catch(function (error) {
        console.error("Error: ", error);
    })

});

quit = () => {
    process.exit(0)
}
setTimeout(quit, 1000);




