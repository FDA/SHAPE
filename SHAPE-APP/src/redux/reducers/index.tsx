import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import localForage from 'localforage';
//@ts-ignore
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
import { firestoreReducer } from 'redux-firestore';
import { firebaseReducer as firebase } from 'react-redux-firebase';
import {
    loading,
    previewMode,
    authentication,
    darkMode,
    org,
    orgs,
    selectedOrg,
    publicSurveys,
    selectedPublicSurvey
} from './Authentication';
import { names, participant, inbox } from './Participant';
import {
    applicationReady,
    consent,
    participantResponse,
    questionnaire,
    questionnaires,
    selectedProfile,
    surveys,
    joinSuccess,
    questionnaireView
} from './Questionnaire';
import { availableDiaries, userDiaryEntries } from './Diary';
import { ehr, receipt } from './Ehr';
//@ts-ignore
import { encryptTransform } from 'redux-persist-transform-encrypt';
//------------ Combined Single State ------------

const appReducer = combineReducers({
    previewMode,
    loading,
    authentication,
    firebase: persistReducer(
        {
            key: 'firebaseState',
            storage: localForage,
            stateReconciler: hardSet,
            transforms: [
                encryptTransform({
                    //Store the secret key in an encrypted location
                    secretKey: "",
                    onError: function (error) {
                        console.error(error);
                    }
                })
            ]
        },
        firebase
    ),
    firestore: firestoreReducer,
    participant: participant,
    names,
    questionnaire,
    questionnaires,
    questionnaireView,
    participantResponse,
    surveys,
    consent,
    inbox,
    applicationReady,
    availableDiaries,
    userDiaryEntries,
    selectedProfile,
    darkMode,
    ehr,
    receipt,
    org,
    orgs,
    selectedOrg,
    publicSurveys,
    selectedPublicSurvey,
    joinSuccess
});

export default appReducer;
