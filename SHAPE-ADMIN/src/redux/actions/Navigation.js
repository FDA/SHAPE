import {
    IS_LOADING,
    TOGGLE_CHANGE_PASSWORD,
    TOGGLE_INITIATE_RESET_PASSWORD,
    TOGGLE_LOGIN,
    TOGGLE_REGISTER
} from './types';

/*********************************************************************
 *   Action creators related to navigating the UI with the NavBar.   *
 *********************************************************************/

//Accessed in the mapDispatchToProps functions of relevant components.
//Used to create actions which are then dispatched to the reducers
//in order to change state.

//------------------Registration/Login Related----------------------

// Login.js, toggleLogin(isLoginOpen)
export function toggleLogin(bool) {
    return {
        type: TOGGLE_LOGIN,
        show: bool
    };
}

//Login.js, toggleLoading(bool), Register.js, toggleLoading
export function isLoading(bool) {
    return {
        type: IS_LOADING,
        isLoading: bool
    };
}

export function toggleRegister(bool) {
    return {
        type: TOGGLE_REGISTER,
        show: bool
    };
}

//Login.js
export function toggleResetPassword(bool) {
    return {
        type: TOGGLE_INITIATE_RESET_PASSWORD,
        payload: {isVisible: bool}
    };
}

//ChangePassword.js
export function toggleChangePassword(bool) {
    return {
        type: TOGGLE_CHANGE_PASSWORD,
        payload: {isVisible: bool}
    };
}
