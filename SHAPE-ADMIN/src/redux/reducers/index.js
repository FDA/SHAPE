import {combineReducers} from 'redux';
import {
    isLoading,
    toggleChangePasswordReducer,
    toggleLogin,
    toggleRegister,
    toggleResetPasswordReducer
} from './Navigation';
import {firestoreReducer} from 'redux-firestore';
import {firebaseReducer} from 'react-redux-firebase';
import {authentication} from './Authentication';
import {questionnaire, questionnaireList} from './Questionnaire';
import {survey, surveyList} from './Survey';

//------------ Combined Single State ------------

const rootReducer = combineReducers({
    showLogin: toggleLogin,

    //In Register.js
    showRegister: toggleRegister,

    //In InitiateResetPassword.js
    showInitiateResetPassword: toggleResetPasswordReducer,

    //In ChangePassword.js
    showChangePassword: toggleChangePasswordReducer,
    authentication,
    //In Register.js
    loading: isLoading,

    firebase: firebaseReducer,
    firestore: firestoreReducer,

    //In Questionnaire.js
    questionnaire,
    questionnaireList,

    //In Survey.js
    survey,
    surveyList
});

export default rootReducer;
