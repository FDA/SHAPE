import {
    USERS_LOGIN_SUCCESS,
    USERS_LOGOUT,
    SET_AS_ADMIN,
    USERS_LOGIN_ERROR,
    USERS_CREATE_SUCCESS,
    USERS_CREATE_FAILED,
    USERS_PASSWORD_RESET_SUCCESS,
    USERS_PASSWORD_RESET_FAIL
} from '../actions/types';

//Reducers for the loggedIn and user properties in the
//Redux state

let user = JSON.parse(localStorage.getItem('user'));
const loggedOutState = {
    loggedIn: false,
    isAdmin: false
};
const loggedInState = {
    authError: false,
    loggedIn: true,
    isAdmin: false
};

const initialState = user ? loggedInState : loggedOutState;

//Login.js
export function authentication(state = initialState, action) {
    switch (action.type) {
        case USERS_LOGIN_SUCCESS:
            let userJSON = JSON.parse(JSON.stringify(action.user));
            localStorage.setItem(
                'user',
                userJSON.stsTokenManager.expirationTime
            );
            return {
                ...initialState,
                loggedIn: true,
                authError: null,
                user: action.user
            };

        case USERS_LOGIN_ERROR:
            return {...state, authError: 'Login Failed'};

        case USERS_CREATE_SUCCESS:
            return {...state, authError: null};

        case USERS_CREATE_FAILED:
            return {...state, authError: action.err.message};

        case USERS_PASSWORD_RESET_FAIL:
            return {
                ...state,
                authError:
                    'Unable to reset your password.  Please contact your adminsitrator for help.'
            };

        case USERS_PASSWORD_RESET_SUCCESS:
            return {...state, authError: null};

        case SET_AS_ADMIN:
            return {
                ...state,
                isAdmin: action.payload
            };

        case USERS_LOGOUT:
            localStorage.removeItem('user');

            return loggedOutState;
        default:
            return state;
    }
}
