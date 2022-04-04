import {
  IS_LOADING,
  PARTICIPANT_CANCELED,
  PARTICIPANT_REMOVE,
  SET_DARK_MODE,
  SET_PREVIEW_MODE,
  USERS_CREATE_FAILED,
  USERS_CREATE_SUCCESS,
  USERS_EMAIL_VERIFICATION_FAIL,
  USERS_EMAIL_VERIFICATION_RESEND_FAIL,
  USERS_EMAIL_VERIFICATION_RESEND_SUCCESS,
  USERS_EMAIL_VERIFICATION_RESET,
  USERS_EMAIL_VERIFICATION_SUCCESS,
  USERS_LOGIN_ERROR,
  USERS_LOGOUT,
  USERS_META_DATA,
  USERS_PASSWORD_CHANGE_FAIL,
  USERS_PASSWORD_CHANGE_SUCCESS,
  USERS_PASSWORD_RESET_FAIL,
  USERS_PASSWORD_RESET_SUCCESS,
  USERS_RESET_AUTH_ERROR,
  USERS_RESET_STATE,
  SET_ORGS,
} from "./types";
import { guid, registerForPush } from "../../utils/Utils";
import configureStore from "../store/configureStore";
import * as firebase from "firebase";
import firebaseConfig from "../../config/firebase.json";
import { batch } from "react-redux";
import { isPlatform } from "@ionic/react";
import { User, Account } from "../../interfaces/DataTypes";
import {
  collections,
  environments,
  firebaseFunctions,
} from "../../utils/Constants";
import { formatISO } from "date-fns";

//Action creators related to authentication process
export const authentication = (user: Account) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    const fail = (error: any) => {
      console.error(`Login Failed in action creator ${error}`);
      dispatch({ type: IS_LOADING, isLoading: false });
      dispatch({ type: USERS_LOGIN_ERROR }, error);
    };

    dispatch({ type: IS_LOADING, isLoading: true });

    const fireBase = getFirebase();
    const authPersistence = isPlatform("capacitor")
      ? firebase.auth.Auth.Persistence.LOCAL
      : firebase.auth.Auth.Persistence.SESSION;

    firebase
      .auth()
      .setPersistence(authPersistence)
      .then(
        fireBase
          .auth()
          .signInWithEmailAndPassword(user.userName, user.password)
          .then(() => {
            fireBase
              .auth()
              .currentUser.getIdToken(true)
              .then((token: string) => {
                const fbFunctions = fireBase.functions();
                const checkAdminRole = fbFunctions.httpsCallable(firebaseFunctions.CHECKADMINROLE);

                checkAdminRole({ token: token }, null)
                .then((result: { data: any }) => {
                  if (result) {
                    const fetchedUser = result.data.user;
                    dispatch({type: USERS_META_DATA, payload: fetchedUser});
                  }
                });
              });
          })
          .catch((err: any) => {
            console.error(`Error logging in ${err}`);
            batch(() => {
              fail(err);
            });
          })
      )
      .catch((err) => {
        console.error(`Error getting user token ${err}`);
        batch(() => {
          fail(err);
        });
      });
  };
};

export const setDarkMode = (bool: boolean) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({
      type: SET_DARK_MODE,
      payload: bool,
    });
  };
};

export const setPreviewMode = (bool: boolean) => {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({
      type: SET_PREVIEW_MODE,
      payload: bool,
    });
  };
};

export const resetPassword = (userName: string) => {
  if (process.env.NODE_ENV === environments.DEVELOPMENT)
    console.log(`Resettting password for user: ${userName}`);
  return (
    dispatch: Function,
    getStates: Function,
    getFirebase: Function,
    getFirestore: Function
  ) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    const fireBase = getFirebase();
    fireBase.firestore();
    fireBase
      .auth()
      .sendPasswordResetEmail(userName)
      .then(() => {
        dispatch({ type: IS_LOADING, isLoading: false });
        dispatch({ type: USERS_PASSWORD_RESET_SUCCESS });
      })
      .catch(() => {
        dispatch({ type: IS_LOADING, isLoading: false });
        dispatch({ type: USERS_PASSWORD_RESET_FAIL });
      });
  };
};

export const validateThenResetPassword = (code: string, password: string) => {
   return (
      dispatch: Function,
      getStates: Function,
      getFirebase: Function,
      getFirestore: Function
   ) => {
      dispatch({ type: IS_LOADING, isLoading: true });
      const fireBase = getFirebase();
      fireBase.firestore();
      firebase
         .auth()
         .verifyPasswordResetCode(code)
         .then((email) => {
            firebase
               .auth()
               .confirmPasswordReset(code, password)
               .then(() => {
                  if (process.env.NODE_ENV === environments.DEVELOPMENT) {
                     console.log("successfully confirmed password reset");
                  }

                  const fbFunctions = firebase.functions();
                  const getCustomClaims = fbFunctions.httpsCallable(
                     firebaseFunctions.GETCUSTOMCLAIMS
                  );
                  getCustomClaims({ email: email })
                  .then((result: { data: any }) => {
                     if (result.data.admin) {
                        window.location.replace(process.env.REACT_APP_ADMIN_URL!);
                     } else {
                        dispatch({ type: USERS_PASSWORD_CHANGE_SUCCESS });
                        dispatch({ type: IS_LOADING, isLoading: false });
                     }
                  })
                  .catch(() => {
                     if (process.env.NODE_ENV === environments.DEVELOPMENT)
                        console.log("error with getCustomClaims()");
                  });
               })
               .catch(function () {
                  if (process.env.NODE_ENV === environments.DEVELOPMENT)
                     console.log("failed password reset");
                  dispatch({ type: USERS_PASSWORD_CHANGE_FAIL });
                  dispatch({ type: IS_LOADING, isLoading: false });
               });
         })
         .catch(function () {
            if (process.env.NODE_ENV === environments.DEVELOPMENT)
               console.log("invalide code for password reset");
            dispatch({ type: USERS_PASSWORD_CHANGE_FAIL });
            dispatch({ type: IS_LOADING, isLoading: false });
         });
   };
};

export const verifyEmail = (code: string) => {
  return (
    dispatch: Function,
    getStates: Function,
    getFirebase: Function,
    getFirestore: Function
  ) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    const fireBase = getFirebase();
    fireBase.firestore();
    firebase
      .auth()
      .applyActionCode(code)
      .then(function (res) {
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
          console.log("email verified");
        dispatch({ type: USERS_EMAIL_VERIFICATION_SUCCESS });
        dispatch({ type: IS_LOADING, isLoading: false });
      })
      .catch(function () {
        if (process.env.NODE_ENV === environments.DEVELOPMENT)
          console.log("invalide code for email verification");
        dispatch({ type: USERS_EMAIL_VERIFICATION_FAIL });
        dispatch({ type: IS_LOADING, isLoading: false });
      });
  };
};

export const resendVerificationEmail = () => {
  return (
    dispatch: Function,
    getStates: Function,
    getFirebase: Function,
    getFirestore: Function
  ) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    const fireBase = getFirebase();
    fireBase.firestore();
    let user = firebase.auth().currentUser;
    //@ts-ignore
    user
      .sendEmailVerification()
      .then((res) => {
        dispatch({ type: IS_LOADING, isLoading: false });
        dispatch({ type: USERS_EMAIL_VERIFICATION_RESEND_SUCCESS });
      })
      .catch((err) => {
        console.error(err);
        dispatch({ type: IS_LOADING, isLoading: false });
        dispatch({ type: USERS_EMAIL_VERIFICATION_RESEND_FAIL });
      });
  };
};

export const clearAuthError = () => {
  return (
    dispatch: Function,
    getStates: Function,
    getFirebase: Function,
    getFirestore: Function
  ) => {
    dispatch({ type: USERS_RESET_AUTH_ERROR });
  };
};

export const resetResendVerification = () => {
  return (
    dispatch: Function,
    getStates: Function,
    getFirebase: Function,
    getFirestore: Function
  ) => {
    dispatch({ type: USERS_EMAIL_VERIFICATION_RESET });
  };
};

export const register = (user: User) => {
  return (
    dispatch: Function,
    getStates: Function,
    getFirebase: Function,
    getFirestore: Function
  ) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    let uid = "";
    var currentUser: any;

    //use a secondary app to create and immediately logout
    var secondaryApp = firebase.initializeApp(firebaseConfig, guid());
    secondaryApp
      .auth()
      .createUserWithEmailAndPassword(user.userName, user.password)
      .then((result: { user: any }) => {
        return new Promise((resolve, reject) => {
          secondaryApp
            .auth()
            .signInWithEmailAndPassword(user.userName, user.password)
            .then(() => {
              resolve(result);
            })
            .catch((e: any) => {
              console.error(e);
              resolve(result);
            });
        });
      })
      .then((result: any) => {
        return new Promise((resolve, reject) => {
          uid = result.user.uid;
          currentUser = secondaryApp.auth().currentUser;

          let dateCreatedAgreed = formatISO(new Date());

          secondaryApp
            .firestore()
            .collection(collections.USERS)
            .doc(uid)
            .set({
              firstName: user.firstName,
              lastName: user.lastName,
              phoneNumber: user.phoneNumber,
              participantId: user.participantId,
              securityQuestions: user.securityQuestions,
              profiles: user.profiles,
              emailEnabled: user.emailEnabled,
              smsEnabled: user.smsEnabled,
              pushEnabled: user.pushEnabled,
              active: true,
              dateCreated: dateCreatedAgreed,
              agreedToTerms: true,
              agreedToTermsDate: dateCreatedAgreed,
              userName: user.userName,
              org: user.org ? user.org : "NORD",
            })
            .then(() => {
              resolve();
            })
            .catch((err: any) => {
              console.error("error caught in users collection set");
              console.error(err);
              reject();
            });
        });
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          // set participant to public = false so it cannot be registered again
          //
          secondaryApp
            .firestore()
            .collection(collections.PARTICIPANT)
            .where("org", "==", user.org)
            .where("participantId", "==", user.participantId)
            .where("public", "==", true)
            .get()
            .then(function (querySnapshot: any) {
              // should only return one
              querySnapshot.forEach(function (doc: any) {
                let docId = doc.id;
                secondaryApp
                  .firestore()
                  .collection(collections.PARTICIPANT)
                  .doc(docId)
                  .set({ public: false }, { merge: true })
                  .then(() => {
                    resolve();
                  })
                  .catch((err: any) => {
                    console.error(
                      `Unable to update the participant record ${err}`
                    );
                    resolve();
                  });
              });
            })
            .catch((err: any) => {
              console.error(`Unable to update participant info ${err}`);
              resolve();
            });
        });
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          // Set custom claim for user to login
          const fbFunctions = secondaryApp.functions();
          const setParticipantId = fbFunctions.httpsCallable(
            firebaseFunctions.SETPARTICIPANTIDCLAIM
          );
          setParticipantId({ email: user.userName })
            .then(() => {
              resolve();
            })
            .catch((err) => {
              console.error(
                `Completed claim UNSUCCESSFULLY for participantID: ${
                  user.participantId
                } @ ${new Date()} because ${err}`
              );
              resolve();
            });
        });
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          //Send email verification
          currentUser
            .sendEmailVerification()
            .then(() => resolve())
            .catch(() => {
              console.error(
                `Unable to verify email for ${JSON.stringify(currentUser)}`
              );
              resolve();
            });
        });
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          //Register for push
          if (user.pushEnabled && isPlatform("capacitor")) {
            registerForPush(uid, function (userDocId: string, token: string) {
              secondaryApp
                .firestore()
                .collection(collections.USERS)
                .doc(userDocId)
                .set({ token: token }, { merge: true })
                .catch((err: any) => {
                  console.error(err);
                });
            })
              .then((res:any) => {
                if (res === false) {
                  secondaryApp
                    .firestore()
                    .collection(collections.USERS)
                    .doc(uid)
                    .set({ pushEnabled: false }, { merge: true })
                    .then(() => resolve())
                    .catch((err: any) => {
                      console.error(err);
                      resolve();
                    });
                  window.alert(
                    "Push notifications are disabled for SHAPE on your phone. You can change this by modifying your device's notification settings."
                  );
                }
                resolve();
              })
              .catch((err:any) => {
                console.error(`Unable to set token info ${err}`);
                resolve();
              });
          } else {
            resolve();
          }
        });
      })
      .then(() => {
        secondaryApp.auth().signOut();
        batch(() => {
          dispatch({ type: IS_LOADING, isLoading: false });
          dispatch({ type: USERS_CREATE_SUCCESS });
          dispatch({ type: PARTICIPANT_REMOVE });
          dispatch({ type: PARTICIPANT_CANCELED });
        });
      })
      .catch((err) => {
        secondaryApp.auth().signOut();
        batch(() => {
          dispatch({ type: IS_LOADING, isLoading: false });
          dispatch({ type: USERS_CREATE_FAILED, err });
        });
      });
  };
};

export function logout() {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: IS_LOADING, isLoading: true });
    const fireBase = getFirebase();
    const { persistor } = configureStore({});
    fireBase
      .auth()
      .signOut()
      .then(() => {
        try {
          persistor.purge();
        } catch (e) {
          console.error(`Error flushing persistor ${e}`);
        }
        dispatch({ type: USERS_LOGOUT });
        dispatch({ type: "RESET" }); // for redux-reset
      })
      .catch((err: any) => {
        console.error(`Firebase signout error! ${err}`);
        dispatch({ type: IS_LOADING, isLoading: false });
      });
  };
}

export function resetUserState() {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({ type: USERS_RESET_STATE });
  };
}

export function getOrgs() {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    const fireStore = firebase.firestore();
    fireStore
      .collection(collections.ORG)
      .get()
      .then(function (querySnapshot) {
        let orgs: Array<{ name: string; id: string }> = [];
        querySnapshot.forEach(function (doc) {
          let data = doc.data();
          orgs.push({ name: data.name, id: data.id });
        });
        dispatch({ type: SET_ORGS, orgs: orgs });
      })
      .catch((err) => {
        console.error(`Unable to update participant info ${err}`);
      });
  };
}

/*********************************************************************
 *   Action creators related to navigating the UI with the NavBar.   *
 *********************************************************************/

//Accessed in the mapDispatchToProps functions of relevant components.
//Used to create actions which are then dispatched to the reducers
//in order to change state.

//------------------Registration/Login Related----------------------

export function isLoading(bool: boolean) {
  return (dispatch: Function, getStates: Function, getFirebase: Function) => {
    dispatch({
      type: IS_LOADING,
      isLoading: bool,
    });
  };
}
