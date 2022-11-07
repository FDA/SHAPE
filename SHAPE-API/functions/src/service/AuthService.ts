import { CallbackFunction } from "../interfaces/components";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, UserCredential } from "firebase/auth";
import * as firebaseConfig from "../../src/firebase-connect.json";

export class AuthService {
   public async get(body: any, callback: CallbackFunction) {
      const { username, password } = body;
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);

      signInWithEmailAndPassword(auth, username, password)
         .then((userCredential: UserCredential) => {
            userCredential.user
               .getIdToken(true)
               .then(async (userToken: string) => {
                  await signOut(auth);
                  await deleteApp(app);
                  callback(false, { userToken: userToken });
               })
               .catch(async (error: any) => {
                  console.error("error caught in getIdToken: " + error);
                  await signOut(auth);
                  await deleteApp(app);
                  callback(true, error);
               });
         })
         .catch(async (error: any) => {
            console.error(
               "error caught in signInWithEmailAndPassword: " + error
            );
            await signOut(auth);
            await deleteApp(app);
            callback(true, error);
         });
   }
}
