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
    USERS_LOGIN_DISABLED_ERROR,
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
    SELECT_ORG,
    PUBLIC_SURVEYS,
    SELECT_PUBLIC_SURVEY
} from './types';
import { guid, registerForPush, isEmptyObject } from '../../utils/Utils';
import configureStore from '../store/configureStore';
import firebaseConfig from '../../config/firebase.json';
import { batch } from 'react-redux';
import { isPlatform } from '@ionic/react';
import { User, Account } from '../../interfaces/DataTypes';
import { collections, environments, firebaseFunctions } from '../../utils/Constants';
import { formatISO } from 'date-fns';
import {
    applyActionCode,
    browserLocalPersistence,
    browserSessionPersistence,
    confirmPasswordReset,
    createUserWithEmailAndPassword,
    getAuth,
    getIdToken,
    sendEmailVerification,
    sendPasswordResetEmail,
    setPersistence,
    signInWithEmailAndPassword,
    signOut,
    UserCredential,
    verifyPasswordResetCode,
    initializeAuth
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
    collection,
    doc,
    getDocs,
    getFirestore,
    query,
    QuerySnapshot,
    setDoc,
    where
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

//Action creators related to authentication process
export const authentication = (userAccount: Account) => {
    return (dispatch: Function) => {
        const fail = (error: any) => {
            console.error(`Login Failed in action creator ${error}`);
            dispatch({ type: IS_LOADING, isLoading: false });
            switch (error.code) {
                case 'auth/too-many-requests':
                    dispatch({ type: USERS_LOGIN_DISABLED_ERROR, err: error });
                    break;
                case 'auth/wrong-password':
                    dispatch({
                        type: USERS_LOGIN_ERROR,
                        err: 'Login Failed, invalid user name or password.'
                    });
                    break;
                default:
                    dispatch({ type: USERS_LOGIN_ERROR, err: error });
                    break;
            }
        };
        dispatch({ type: IS_LOADING, isLoading: true });

        const auth = getAuth();
        if (isPlatform('capacitor')) {
            setPersistence(auth, browserLocalPersistence);
        } else {
            setPersistence(auth, browserSessionPersistence);
        }

        signInWithEmailAndPassword(auth, userAccount.userName, userAccount.password)
            .then((credentialedUser: UserCredential) => {
                const { user } = credentialedUser;
                getIdToken(user, true)
                    .then((token: string) => {
                        const functions = getFunctions();
                        const checkAdminRole = httpsCallable(functions, firebaseFunctions.CHECKADMINROLE);
                        //@ts-ignore
                        checkAdminRole({ token: token }, null)
                            .then((result: { data: any }) => {
                                if (result) {
                                    const fetchedUser = result.data.user;
                                    if (fetchedUser.admin === true) {
                                        signOut(auth);
                                        batch(() => {
                                            fail('Account does not have access.');
                                        });
                                    } else {
                                        dispatch({
                                            type: USERS_META_DATA,
                                            payload: fetchedUser
                                        });
                                    }
                                }
                            })
                            .catch((err: any) => {
                                console.error(`error checking admin role: ` + err);
                                batch(() => {
                                    fail(err);
                                });
                            });
                    })
                    .catch((err) => {
                        console.error(`Error getting user token: ${err}`);
                        batch(() => {
                            fail(err);
                        });
                    });
            })
            .catch((err: any) => {
                console.error(`Error signing in with email and password: ${err}`);
                batch(() => {
                    fail(err);
                });
            });
    };
};

export const setDarkMode = (bool: boolean) => {
    return (dispatch: Function) => {
        dispatch({
            type: SET_DARK_MODE,
            payload: bool
        });
    };
};

export const setPreviewMode = (bool: boolean) => {
    return (dispatch: Function) => {
        dispatch({
            type: SET_PREVIEW_MODE,
            payload: bool
        });
    };
};

export const selectOrg = (org: string) => {
    return (dispatch: Function) => {
        dispatch({
            type: SELECT_ORG,
            payload: org
        });
    };
};

export const selectPublicSurvey = (id: string, org: string, name: string) => {
    return (dispatch: Function) => {
        dispatch({
            type: SELECT_PUBLIC_SURVEY,
            payload: { id: id, org: org, name: name }
        });
        dispatch({
            type: SELECT_ORG,
            payload: org
        });
    };
};

export const resetPassword = (userName: string) => {
    if (process.env.NODE_ENV === environments.DEVELOPMENT)
        console.log(`Resettting password for user: ${userName}`);
    return (dispatch: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        const auth = getAuth();
        sendPasswordResetEmail(auth, userName)
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
    return (dispatch: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        const auth = getAuth();
        verifyPasswordResetCode(auth, code)
            .then((email) => {
                confirmPasswordReset(auth, code, password)
                    .then(() => {
                        if (process.env.NODE_ENV === environments.DEVELOPMENT) {
                            console.log('successfully confirmed password reset');
                        }
                        const functions = getFunctions();
                        const getCustomClaims = httpsCallable(functions, firebaseFunctions.GETCUSTOMCLAIMS);
                        getCustomClaims({ email: email })
                            .then((result: { data: any }) => {
                                if (result?.data?.admin) {
                                    window.location.replace(process.env.REACT_APP_ADMIN_URL!);
                                } else {
                                    dispatch({
                                        type: USERS_PASSWORD_CHANGE_SUCCESS
                                    });
                                    dispatch({
                                        type: IS_LOADING,
                                        isLoading: false
                                    });
                                }
                            })
                            .catch(() => {
                                dispatch({ type: USERS_PASSWORD_CHANGE_FAIL });
                                dispatch({ type: IS_LOADING, isLoading: false });
                            });
                    })
                    .catch(() => {
                        console.error('failed password reset');
                        dispatch({ type: USERS_PASSWORD_CHANGE_FAIL });
                        dispatch({ type: IS_LOADING, isLoading: false });
                    });
            })
            .catch(() => {
                console.error('invalid code for password reset');
                dispatch({ type: USERS_PASSWORD_CHANGE_FAIL });
                dispatch({ type: IS_LOADING, isLoading: false });
            });
    };
};

export const verifyEmail = (code: string) => {
    return (dispatch: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        const auth = getAuth();
        applyActionCode(auth, code)
            .then(() => {
                if (process.env.NODE_ENV === environments.DEVELOPMENT) console.log('email verified');
                dispatch({ type: USERS_EMAIL_VERIFICATION_SUCCESS });
                dispatch({ type: IS_LOADING, isLoading: false });
            })
            .catch(() => {
                if (process.env.NODE_ENV === environments.DEVELOPMENT)
                    console.log('invalid code for email verification');
                dispatch({ type: USERS_EMAIL_VERIFICATION_FAIL });
                dispatch({ type: IS_LOADING, isLoading: false });
            });
    };
};

export const resendVerificationEmail = () => {
    return (dispatch: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            sendEmailVerification(user)
                .then(() => {
                    dispatch({ type: IS_LOADING, isLoading: false });
                    dispatch({ type: USERS_EMAIL_VERIFICATION_RESEND_SUCCESS });
                })
                .catch((err) => {
                    console.error(err);
                    dispatch({ type: IS_LOADING, isLoading: false });
                    dispatch({ type: USERS_EMAIL_VERIFICATION_RESEND_FAIL });
                });
        } else {
            //auth.currentUser is null
            console.error('current user not found, please log back in and try again');
            dispatch({ type: IS_LOADING, isLoading: false });
            dispatch({ type: USERS_EMAIL_VERIFICATION_RESEND_FAIL });
        }
    };
};

export const clearAuthError = () => {
    return (dispatch: Function) => {
        dispatch({ type: USERS_RESET_AUTH_ERROR });
    };
};

export const resetResendVerification = () => {
    return (dispatch: Function) => {
        dispatch({ type: USERS_EMAIL_VERIFICATION_RESET });
    };
};

export const register = (user: User) => {
    return (dispatch: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        let uid = '';
        let currentUser: any;
        //use a secondary app to create and immediately logout
        const secondaryApp = initializeApp(firebaseConfig, guid());

        if (isPlatform('capacitor')) {
            initializeAuth(secondaryApp, {
                persistence: browserLocalPersistence
            });
        }
        const secondaryAuth = getAuth(secondaryApp);
        const secondaryFirestore = getFirestore(secondaryApp);

        createUserWithEmailAndPassword(secondaryAuth, user.userName, user.password)
            .then((result: { user: any }) => {
                return new Promise((resolve) => {
                    signInWithEmailAndPassword(secondaryAuth, user.userName, user.password)
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
                return new Promise<void>((resolve, reject) => {
                    uid = result.user.uid;
                    currentUser = secondaryAuth.currentUser;
                    const dateCreatedAgreed = formatISO(new Date());
                    const docRef = doc(secondaryFirestore, collections.USERS, uid);
                    const userData = {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phoneNumber: user.phoneNumber,
                        participantId: user.participantId,
                        profiles: user.profiles,
                        emailEnabled: user.emailEnabled,
                        smsEnabled: user.smsEnabled,
                        pushEnabled: user.pushEnabled,
                        active: true,
                        dateCreated: dateCreatedAgreed,
                        agreedToTerms: true,
                        agreedToTermsDate: dateCreatedAgreed,
                        userName: user.userName,
                        org: user.org
                    };
                    setDoc(docRef, userData)
                        .then(() => {
                            resolve();
                        })
                        .catch((err: any) => {
                            console.error('error caught in users collection set');
                            console.error(err);
                            reject();
                        });
                });
            })
            .then(() => {
                return new Promise<void>((resolve) => {
                    // if the user is a private registrant
                    if (!isEmptyObject(user.org)) {
                        // set participant to public = false so it cannot be registered again
                        const q = query(
                            collection(secondaryFirestore, collections.PARTICIPANT),
                            where('org', '==', user.org[0]),
                            where('participantId', '==', user.participantId[0].id),
                            where('public', '==', true)
                        );
                        getDocs(q)
                            .then((querySnapshot: QuerySnapshot) => {
                                // should only return one
                                querySnapshot.forEach((document: any) => {
                                    const docRef = doc(
                                        secondaryFirestore,
                                        collections.PARTICIPANT,
                                        document.id
                                    );
                                    setDoc(docRef, { public: false, userId: uid }, { merge: true })
                                        .then(() => {
                                            resolve();
                                        })
                                        .catch((err: any) => {
                                            console.error(`Unable to update the participant record ${err}`);
                                        });
                                });
                            })
                            .catch((err: any) => {
                                console.error(`Unable to update participant info ${err}`);
                                resolve();
                            });
                    } else {
                        // else user is a public registrant and no participant record should be created
                        resolve();
                    }
                });
            })
            .then(() => {
                return new Promise<void>((resolve) => {
                    //Send email verification
                    sendEmailVerification(currentUser)
                        .then(() => resolve())
                        .catch(() => {
                            console.error(`Unable to verify email for ${JSON.stringify(currentUser)}`);
                            resolve();
                        });
                });
            })
            .then(() => {
                return new Promise<void>((resolve) => {
                    //Register for push
                    if (user.pushEnabled && isPlatform('capacitor')) {
                        registerForPush(uid, (userDocId: string, token: string) => {
                            const docRef = doc(secondaryFirestore, collections.USERS, userDocId);
                            const docData = { token: token };
                            setDoc(docRef, docData, { merge: true }).catch((err: any) => {
                                console.error(`error setting token for ${user}: ` + err);
                            });
                        })
                            .then((res: boolean) => {
                                if (res === false) {
                                    const docRef = doc(secondaryFirestore, collections.USERS, uid);
                                    const docData = { pushEnabled: false };

                                    setDoc(docRef, docData, { merge: true })
                                        .then(() => resolve())
                                        .catch((err: any) => {
                                            console.error(`error setting pushEnabled for ${user}: ` + err);
                                            resolve();
                                        });
                                    window.alert(
                                        "Push notifications are disabled for SHAPE on your phone. You can change this by modifying your device's notification settings."
                                    );
                                }
                                resolve();
                            })
                            .catch((err: any) => {
                                console.error(`Unable to set token info ${err}`);
                                resolve();
                            });
                    } else {
                        resolve();
                    }
                });
            })
            .then(() => {
                signOut(secondaryAuth);
                batch(() => {
                    dispatch({ type: IS_LOADING, isLoading: false });
                    dispatch({ type: USERS_CREATE_SUCCESS });
                    dispatch({ type: PARTICIPANT_REMOVE });
                    dispatch({ type: PARTICIPANT_CANCELED });
                });
            })
            .catch((err) => {
                signOut(secondaryAuth);
                batch(() => {
                    dispatch({ type: IS_LOADING, isLoading: false });
                    dispatch({ type: USERS_CREATE_FAILED, err });
                });
            });
    };
};

export function logout() {
    return (dispatch: Function, getStates: Function) => {
        const state = getStates();
        const darkMode = state.darkMode;

        dispatch({ type: IS_LOADING, isLoading: true });
        const auth = getAuth();
        const { persistor } = configureStore({});
        signOut(auth)
            .then(() => {
                try {
                    persistor.purge();
                } catch (e) {
                    console.error(`Error flushing persistor ${e}`);
                }
                dispatch({ type: USERS_LOGOUT });
                dispatch({ type: 'RESET' }); // for redux-reset
                dispatch({
                    type: SET_DARK_MODE,
                    payload: darkMode
                });
            })
            .catch((err: any) => {
                console.error(`Firebase signout error! ${err}`);
                dispatch({ type: IS_LOADING, isLoading: false });
            });
    };
}

export function resetUserState() {
    return (dispatch: Function) => {
        dispatch({ type: USERS_RESET_STATE });
    };
}

export function getOrgs() {
    return (dispatch: Function) => {
        const firestore = getFirestore();
        const collectionRef = collection(firestore, collections.ORG);

        getDocs(collectionRef)
            .then((querySnapshot: QuerySnapshot) => {
                const orgs: Array<{ name: string; id: string }> = [];
                querySnapshot.forEach((document: any) => {
                    const org = document.data();
                    orgs.push({ name: org.name, id: org.id });
                });
                dispatch({ type: SET_ORGS, orgs: orgs });
            })
            .catch((err: any) => {
                console.error(`Unable to update participant info ${err}`);
            });
    };
}

export function getPublicSurveys() {
    return (dispatch: Function, getStates: Function) => {
        const firestore = getFirestore();
        const state = getStates();

        const q = query(
            collection(firestore, collections.SURVEY),
            where('open', '==', true),
            where('public', '==', true)
        );
        getDocs(q)
            .then((querySnapshot: QuerySnapshot) => {
                const surveys: Array<{ id: string; org: string; name: string }> = [];
                querySnapshot.forEach((document: any) => {
                    const survey = document.data();
                    if (!survey.participants.includes(state.firebase.auth.uid)) {
                        surveys.push({
                            id: document.id,
                            org: survey.org,
                            name: survey.name
                        });
                    }
                });
                dispatch({ type: PUBLIC_SURVEYS, surveys: surveys });
            })
            .catch((error: any) => {
                console.error('Error getting public surveys: ', error);
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
    return (dispatch: Function) => {
        dispatch({
            type: IS_LOADING,
            isLoading: bool
        });
    };
}
