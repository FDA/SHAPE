//Action types. Consts used as action types throughout the
//project.
//**************redux/actions/Authentication.js********************
// Related to user login and authentication

export const USERS_LOGIN_SUCCESS = 'USERS_LOGIN_SUCCESS';
export const USERS_CREATE_SUCCESS = 'USERS_CREATE_SUCCESS';
export const USERS_CREATE_FAILED = 'USERS_CREATE_FAILED';
export const USERS_LOGIN_ERROR = 'USERS_LOGIN_ERROR';
export const USERS_LOGOUT = 'USERS_LOGOUT';
export const USERS_PASSWORD_RESET = 'USERS_PASSWORD_RESET';
export const USERS_PASSWORD_RESET_SUCCESS = 'USERS_PASSWORD_RESET_SUCCESS';
export const USERS_PASSWORD_RESET_FAIL = 'USERS_PASSWORD_RESET_FAIL';

//**************redux/actions/Navigation.js********************
// Login.js
export const TOGGLE_LOGIN = 'TOGGLE_LOGIN';
export const SET_AS_ADMIN = 'SET_AS_ADMIN';

// Register.js
export const TOGGLE_REGISTER = 'TOGGLE_REGISTER';
export const IS_LOADING = 'IS_LOADING';

// InitiateResetPassword.js
export const TOGGLE_INITIATE_RESET_PASSWORD = 'TOGGLE_INITIATE_RESET_PASSWORD';

// ChangePassword.js
export const TOGGLE_CHANGE_PASSWORD = 'TOGGLE_CHANGE_PASSWORD';

//**************redux/actions/Participant.js********************
export const ACTIVE_PARTICIPANT = 'ACTIVE_PARTICIPANT';
export const PARTICIPANT_LOOKUP_FAILED = 'PARTICIPANT_LOOKUP_FAILED';

//**************redux/actions/Questionnaire.js********************
export const Q13 = 'Q13';
export const Q13_UPDATE = 'Q13_UPDATE';
export const UPDATE_QUESTIONNAIRE_LIST = 'UPDATE_QUESTIONNAIRE_LIST';
export const STORE_QUESTIONNAIRE_LIST = 'STORE_QUESTIONNAIRE_LIST';
export const REMOVE_FROM_QUESTIONNAIRE_LIST = 'REMOVE_FROM_QUESTIONNAIRE_LIST';
export const ADD_TO_QUESTIONNAIRE_LIST = 'ADD_TO_QUESTIONNAIRE_LIST';

//**************redux/actions/Survey.js********************
export const SURVEY = 'SURVEY';
export const SURVEY_UPDATE = 'SURVEY_UPDATE';
export const STORE_SURVEY_LIST = 'STORE_SURVEY_LIST';
export const ADD_TO_SURVEY_LIST = 'ADD_TO_SURVEY_LIST';
export const REMOVE_FROM_SURVEY_LIST = 'REMOVE_FROM_SURVEY_LIST';
export const UPDATE_SURVEY_LIST = 'UPDATE_SURVEY_LIST';
