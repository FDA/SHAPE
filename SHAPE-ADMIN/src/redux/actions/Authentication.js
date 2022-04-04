import {
    IS_LOADING,
    SET_AS_ADMIN,
    USERS_CREATE_FAILED,
    USERS_CREATE_SUCCESS,
    USERS_LOGIN_ERROR,
    USERS_LOGIN_SUCCESS,
    USERS_LOGOUT,
    USERS_PASSWORD_RESET_FAIL,
    USERS_PASSWORD_RESET_SUCCESS
} from './types';
import {batch} from 'react-redux';
import * as firebase from 'firebase';
import {createUser} from '../../utils/API';

//Action creators related to authentication process
export const authentication = (shapeUser) => {
    return (dispatch, getStates, getFirebase) => {
        dispatch({type: IS_LOADING, isLoading: true});

        const fireBase = getFirebase();
        firebase
            .auth()
            .setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(
                fireBase
                    .auth()
                    .signInWithEmailAndPassword(
                        shapeUser.userName,
                        shapeUser.password
                    )
                    .then((credentialedUser) => {
                        const {user} = credentialedUser;
                        try {
                            fireBase
                                .auth()
                                .currentUser.getIdToken(true)
                                .then((token) => {
                                    const fbFunctions = fireBase.functions();
                                    const checkAdminRole = fbFunctions.httpsCallable(
                                        'checkAdminRole'
                                    );
                                    checkAdminRole({token: token}, null)
                                        .then(function (result) {
                                            try {
                                                if (!result.data.user.admin) {
                                                    dispatch(logout());
                                                    throw new Error(
                                                        'User is not an admin'
                                                    );
                                                }
                                            } catch (e) {
                                                batch(() => {
                                                    console.error(
                                                        `Login Failed in action creator ${e}`
                                                    );
                                                    dispatch({
                                                        type: IS_LOADING,
                                                        isLoading: false
                                                    });
                                                    dispatch(
                                                        {
                                                            type: USERS_LOGIN_ERROR
                                                        },
                                                        e
                                                    );
                                                });
                                            }
                                        })
                                        .catch((err) => {
                                            batch(() => {
                                                console.error(
                                                    `Login Failed in action creator ${err}`
                                                );
                                                dispatch({
                                                    type: IS_LOADING,
                                                    isLoading: false
                                                });
                                                dispatch(
                                                    {type: USERS_LOGIN_ERROR},
                                                    err
                                                );
                                            });
                                        });
                                })
                                .catch((err) => {
                                    console.error(
                                        `Error getting user token ${err}`
                                    );
                                    throw err;
                                });
                        } catch (e) {
                            console.error(`Error getting token ${e}`);
                            batch(() => {
                                console.error(
                                    `Login Failed in action creator ${e}`
                                );
                                dispatch({type: IS_LOADING, isLoading: false});
                                dispatch({type: USERS_LOGIN_ERROR}, e);
                            });
                        }
                        batch(() => {
                            dispatch({type: IS_LOADING, isLoading: false});
                            dispatch({type: USERS_LOGIN_SUCCESS, user});
                        });
                    })
                    .catch((err) => {
                        console.error(`Login Failed in action creator`);
                        dispatch({type: IS_LOADING, isLoading: false});
                        dispatch({type: USERS_LOGIN_ERROR}, err);
                    })
            )
            .catch((err) => {
                console.error(`Login Failed in action creator ${err}`);
                dispatch({type: IS_LOADING, isLoading: false});
                dispatch({type: USERS_LOGIN_ERROR, err});
            });
    };
};

export const resetPassword = (user) => {
    return (dispatch, getStates, getFirebase, getFirestore) => {
        dispatch({type: IS_LOADING, isLoading: true});
        const fireBase = getFirebase();
        fireBase
            .auth()
            .sendPasswordResetEmail(user.userName)
            .then(() => {
                dispatch({type: IS_LOADING, isLoading: false});
                dispatch({type: USERS_PASSWORD_RESET_SUCCESS});
            })
            .catch(() => {
                dispatch({type: IS_LOADING, isLoading: false});
                dispatch({type: USERS_PASSWORD_RESET_FAIL});
            });
    };
};

export const register = (user) => {
    return (dispatch, getStates, getFirebase, getFirestore) => {
        dispatch({type: IS_LOADING, isLoading: true});
        const fireBase = getFirebase();
        fireBase
            .auth()
            .createUserWithEmailAndPassword(user.userName, user.password)
            .then((result) => {
                return createUser(result.user.uid, {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    participantId: user.participantId,
                    linkedParticipants: user.linkedParticipants,
                    securityQuestions: user.securityQuestions
                }).catch((err) => {
                    console.error(err);
                });
            })
            .then(() => {
                dispatch({type: IS_LOADING, isLoading: false});
                dispatch({type: USERS_CREATE_SUCCESS});
            })
            .catch((err) => {
                dispatch({type: IS_LOADING, isLoading: false});
                dispatch({type: USERS_CREATE_FAILED, err});
            });
    };
};

export function logout() {
    return (dispatch, getStates, getFirebase) => {
        dispatch({type: IS_LOADING, isLoading: true});
        const fireBase = getFirebase();
        fireBase
            .auth()
            .signOut()
            .then(() => {
                dispatch({type: USERS_LOGOUT});
                dispatch({type: IS_LOADING, isLoading: false});
            })
            .catch((err) => {
                console.error(`Firebase signout error! ${err}`);
                dispatch({type: IS_LOADING, isLoading: false});
            });
    };
}

export function setAsAdmin(bool) {
    return {
        type: SET_AS_ADMIN,
        payload: bool
    };
}
