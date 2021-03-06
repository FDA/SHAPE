import {
    Q13,
    Q13_UPDATE,
    IS_LOADING,
    UPDATE_QUESTIONNAIRE_LIST,
    ADD_TO_QUESTIONNAIRE_LIST,
    STORE_QUESTIONNAIRE_LIST,
    REMOVE_FROM_QUESTIONNAIRE_LIST
} from './types';
import {
    getQuestionnaire,
    editQuestionnaire,
    createQuestionnaire,
    getQuestionnaires
} from '../../utils/API';
import {isEmptyObject} from '../../utils/Utils';

export const storeQuestionnaire = (questionnaireId) => {
    return (dispatch, getStates, getFirebase) => {
        dispatch({type: IS_LOADING, isLoading: true});
        getQuestionnaire(questionnaireId)
            .then((doc) => {
                let data = {...doc.data};
                data = {...data, id: questionnaireId};
                dispatch({type: Q13, data});
                dispatch({type: IS_LOADING, isLoading: false});
            })
            .catch(function (error) {
                console.error('Error getting documents: ', error);
                dispatch({type: IS_LOADING, isLoading: false});
            });
    };
};

export const updateQuestionnaire = (questionnaireId, questionnaire) => {
    return (dispatch, getStates, getFirebase) => {
        dispatch({type: IS_LOADING, isLoading: true});
        if (!isEmptyObject(questionnaire.id)) delete questionnaire.id;
        editQuestionnaire(questionnaireId, questionnaire)
            .then((res) => {
                let data = {...questionnaire, id: questionnaireId};
                dispatch({type: Q13_UPDATE, data});
                dispatch({type: UPDATE_QUESTIONNAIRE_LIST, data});
                dispatch({type: IS_LOADING, isLoading: false});
            })
            .catch((err) => {
                console.error(err);
                dispatch({type: IS_LOADING, isLoading: false});
            });
    };
};

export const storeQuestionnaireList = (surveyId) => {
    return (dispatch, getStates, getFirebase) => {
        try {
            dispatch({type: IS_LOADING, isLoading: true});
            getQuestionnaires(surveyId)
                .then((snapshot) => {
                    let questionnaireList = [];
                    snapshot.forEach((doc) => {
                        let questionnaire = doc.data;
                        questionnaire.id = doc.id;
                        questionnaireList.push(questionnaire);
                    });
                    questionnaireList = questionnaireList.sort((a, b) =>
                        a.dateCreated < b.dateCreated ? 1 : -1
                    );

                    let data = questionnaireList;
                    dispatch({type: STORE_QUESTIONNAIRE_LIST, data});
                    dispatch({type: IS_LOADING, isLoading: false});
                })
                .catch((err) => {
                    console.error('Error getting documents', err);
                    dispatch({type: IS_LOADING, isLoading: false});
                });
        } catch (err) {
            console.error(err);
            dispatch({type: IS_LOADING, isLoading: false});
        }
    };
};

export const newQuestionnaire = (questionnaire) => {
    return (dispatch, getStates, getFirebase) => {
        dispatch({type: IS_LOADING, isLoading: true});
        createQuestionnaire(questionnaire)
            .then(async (resp) => {
                const res = await resp.json();
                let id = res.DATA.id;
                let data = {...questionnaire, id: id};

                dispatch({type: ADD_TO_QUESTIONNAIRE_LIST, data});
                dispatch({type: IS_LOADING, isLoading: false});
            })
            .catch((err) => {
                console.error(err);
                dispatch({type: IS_LOADING, isLoading: false});
            });
    };
};

export const removeQuestionnaire = (questionnaireId) => {
    return (dispatch, getStates, getFirebase) => {
        let data = {questionnaireId: questionnaireId};
        dispatch({type: REMOVE_FROM_QUESTIONNAIRE_LIST, data});
    };
};
