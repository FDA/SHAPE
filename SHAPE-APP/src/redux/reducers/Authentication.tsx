import {
  IS_LOADING,
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
  USERS_META_DATA,
  USERS_PASSWORD_CHANGE_FAIL,
  USERS_PASSWORD_CHANGE_SUCCESS,
  USERS_PASSWORD_RESET_FAIL,
  USERS_PASSWORD_RESET_SUCCESS,
  USERS_RESET_AUTH_ERROR,
  USERS_RESET_STATE,
  SET_PREVIEW_ORG,
  SET_ORGS,
} from "../actions/types";
import { User } from "../../interfaces/DataTypes";

//Reducers for the loggedIn and user properties in the
//Redux state

let user;
const loggedOutState = {
  user: {
    loggedIn: false,
    isAdmin: false,
  },
};

const initialState = user
  ? {
      authError: false,
      loggedIn: true,
      isAdmin: false,
      user,
      profile: {},
    }
  : loggedOutState;

export function darkMode(
  state = false,
  action: { type: string; payload: boolean }
) {
  switch (action.type) {
    case SET_DARK_MODE:
      return action.payload;
    default:
      return state;
  }
}

export function previewMode(
  state = false,
  action: { type: string; payload: boolean }
) {
  switch (action.type) {
    case SET_PREVIEW_MODE:
      return action.payload;
    default:
      return state;
  }
}

export function org(state = false, action: { type: string; org: string }) {
  switch (action.type) {
    case SET_PREVIEW_ORG:
      return action.org;
    default:
      return state;
  }
}

/*********************************************************************
 *       Reducers related to navigating the UI with the NavBar.      *
 *********************************************************************/

// Pure functions that takes the previous state and action, and
// return the next state. Each manages its own part of the global
// state.

//------------------Registration/Login Related----------------------

//Register.js, toggleLoading()
export function loading(
  state = false,
  action: { type: string; isLoading: boolean }
) {
  switch (action.type) {
    case IS_LOADING:
      return action.isLoading;

    default:
      return state;
  }
}

export function userMeta(state = {}, action: { type: string; payload: User }) {
  switch (action.type) {
    case USERS_META_DATA:
      const userData = action.payload;
      const meta = { ...userData };
      return { ...state, ...meta };

    default:
      return state;
  }
}

export function orgs(
  state = [],
  action: { type: string; orgs: Array<{ name: string; id: string }> }
) {
  switch (action.type) {
    case SET_ORGS:
      return action.orgs;
    default:
      return state;
  }
}

export function authentication(state = initialState, action: { type: string; user: any; err: any }) {
  switch (action.type) {
    case USERS_RESET_STATE:
      return initialState;

    case USERS_LOGIN_ERROR:
      return {
        ...state,
        authError: `Login Failed, invalid user name or password.`,
      };

    case USERS_CREATE_SUCCESS:
      return { ...state, authError: null, registrationSuccess: true };

    case USERS_CREATE_FAILED:
      return {
        ...state,
        authError: true,
        errorMessage: action.err.message,
        registrationSuccess: false,
      };

    case USERS_PASSWORD_RESET_FAIL:
      return {
        ...state,
        authError:
          "Unable to reset your password.  Please contact your adminsitrator for help.",
        passwordResetSuccess: false,
      };

    case USERS_PASSWORD_RESET_SUCCESS:
      return { ...state, authError: null, passwordResetSuccess: true };

    case USERS_PASSWORD_CHANGE_SUCCESS:
      return { ...state, authError: null, passwordChangeSuccess: true };

    case USERS_PASSWORD_CHANGE_FAIL:
      return {
        ...state,
        authError: "Password change failed. Please try again.",
        passwordChangeSuccess: false,
      };

    case USERS_EMAIL_VERIFICATION_SUCCESS:
      return { ...state, authError: null, emailVerificationSuccess: true };

    case USERS_EMAIL_VERIFICATION_FAIL:
      return {
        ...state,
        authError:
          "Email verification failed. Please try again or request a new email if the problem persists.",
        emailVerificationSuccess: false,
      };

    case USERS_EMAIL_VERIFICATION_RESEND_SUCCESS:
      return {
        ...state,
        authError: null,
        emailVerificationResendSuccess: true,
      };

    case USERS_EMAIL_VERIFICATION_RESEND_FAIL:
      return {
        ...state,
        authError: "Email verification failed to resend. Please try again.",
        emailVerificationResendSuccess: false,
      };

    case USERS_RESET_AUTH_ERROR:
      return { ...state, authError: null };

    case USERS_EMAIL_VERIFICATION_RESET:
      return {
        ...state,
        authError: null,
        emailVerificationResendSuccess: null,
      };

    default:
      return state;
  }
}
