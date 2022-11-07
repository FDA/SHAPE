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
import { 
   browserSessionPersistence, 
   getAuth, 
   setPersistence, 
   signInWithEmailAndPassword, 
   sendPasswordResetEmail, 
   createUserWithEmailAndPassword, 
   signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions'
import {createUser} from '../../utils/API';

//Action creators related to authentication process
export const authentication = (shapeUser) => {
   return (dispatch, getStates, getFirebase) => {
      dispatch({ type: IS_LOADING, isLoading: true });
      const auth = getAuth();
      setPersistence(auth, browserSessionPersistence)
         .then(() => {
            signInWithEmailAndPassword(
               auth,
               shapeUser.userName,
               shapeUser.password
            )
               .then((credentialedUser) => {
                  const { user } = credentialedUser;
                  auth.currentUser.getIdToken(true)
                     .then((token) => {
                        const fbFunctions = getFunctions();
                        const checkAdminRole = httpsCallable(fbFunctions,
                           'checkAdminRole'
                        );
                        checkAdminRole({ token: token }, null)
                           .then((result) => {
                              if (!result.data.user.admin) {
                                 batch(() => {
                                    dispatch(logout());
                                    dispatch({type: IS_LOADING, isLoading: false});
                                    dispatch({type: USERS_LOGIN_ERROR});
                                 });
                                 throw new Error('User is not an admin');
                              }
                           })
                           .catch((err) => {
                              console.error(`Login Failed in action creator ${err}`);
                              batch(() => {
                                 dispatch({type: IS_LOADING, isLoading: false});
                                 dispatch({type: USERS_LOGIN_ERROR},err);
                              });
                           });
                     })
                     .catch((err) => {
                        console.error(`Error getting user token ${err}`);
                        dispatch({ type: IS_LOADING, isLoading: false });
                        dispatch({ type: USERS_LOGIN_ERROR }, err);
                        throw err;
                     });
                  batch(() => {
                     dispatch({ type: IS_LOADING, isLoading: false });
                     dispatch({ type: USERS_LOGIN_SUCCESS, user });
                  });
               })
               .catch((err) => {
                  console.error(`Login Failed: user not found`);
                  dispatch({ type: IS_LOADING, isLoading: false });
                  dispatch({ type: USERS_LOGIN_ERROR }, err);
               });
         })
         .catch((err) => {
            console.error(`Login Failed in action creator ${err}`);
            dispatch({ type: IS_LOADING, isLoading: false });
            dispatch({ type: USERS_LOGIN_ERROR, err });
         });
   };
};

export const resetPassword = (user) => {
    return (dispatch, getStates, getFirebase, getFirestore) => {
        dispatch({type: IS_LOADING, isLoading: true});
        const auth = getAuth();
        sendPasswordResetEmail(auth, user.userName)
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
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, user.userName, user.password)
            .then(async (result) => {
                try {
                  return await createUser(result.user.uid, {
                     firstName: user.firstName,
                     lastName: user.lastName,
                     phoneNumber: user.phoneNumber,
                     participantId: user.participantId,
                     linkedParticipants: user.linkedParticipants,
                     securityQuestions: user.securityQuestions
                  });
               } catch (err) {
                  console.error(err);
                  dispatch({type: IS_LOADING, isLoading: false});
                  dispatch({type: USERS_CREATE_FAILED, err});
               }
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
        const auth = getAuth();
        signOut(auth)
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
