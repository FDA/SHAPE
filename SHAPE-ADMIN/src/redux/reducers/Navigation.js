import {
    IS_LOADING,
    TOGGLE_CHANGE_PASSWORD,
    TOGGLE_INITIATE_RESET_PASSWORD,
    TOGGLE_LOGIN,
    TOGGLE_REGISTER
} from '../actions/types';

/*********************************************************************
 *       Reducers related to navigating the UI with the NavBar.      *
 *********************************************************************/

// Pure functions that takes the previous state and action, and
// return the next state. Each manages its own part of the global
// state.

//------------------Registration/Login Related----------------------

// Login.js
export function toggleLogin(state = false, action) {
    switch (action.type) {
        case TOGGLE_LOGIN:
            return action.show;

        default:
            return state;
    }
}

//Register.js, toggleRegister()
export function toggleRegister(state = false, action) {
    switch (action.type) {
        case TOGGLE_REGISTER:
            return action.show;

        default:
            return state;
    }
}

//Register.js, toggleLoading()
export function isLoading(state = false, action) {
    switch (action.type) {
        case IS_LOADING:
            return action.isLoading;

        default:
            return state;
    }
}

//InitiateResetPassword.js
export function toggleResetPasswordReducer(state = false, action) {
    switch (action.type) {
        case TOGGLE_INITIATE_RESET_PASSWORD:
            return action.payload.isVisible;
        default:
            return state;
    }
}

//ChangePassword.js
export function toggleChangePasswordReducer(state = false, action) {
    switch (action.type) {
        case TOGGLE_CHANGE_PASSWORD:
            return action.payload.isVisible;
        default:
            return state;
    }
}
