import {
    SURVEY,
    SURVEY_UPDATE,
    STORE_SURVEY_LIST,
    UPDATE_SURVEY_LIST,
    REMOVE_FROM_SURVEY_LIST,
    ADD_TO_SURVEY_LIST,
    IS_LOADING
} from './types';
import {getSurvey, editSurvey, getSurveys} from '../../utils/API';
import {isEmptyObject} from '../../utils/Utils';
import {compareDesc} from 'date-fns';

export const storeSurvey = (surveyId) => {
    return (dispatch, getStates, getFirebase) => {
        getSurvey(surveyId)
            .then((doc) => {
                let data = doc.data;
                data = {...data, id: surveyId};
                if (!isEmptyObject(data)) {
                    dispatch({type: SURVEY, data});
                }
            })
            .catch(function (error) {
                console.error('Error getting documents: ', error);
            });
    };
};

export const updateSurvey = (surveyId, survey) => {
    return (dispatch, getStates, getFirebase) => {
        dispatch({type: IS_LOADING, isLoading: true});
        delete survey.id;

        editSurvey(surveyId, survey)
            .then(() => {
                let data = {...survey, id: surveyId};
                dispatch({type: SURVEY_UPDATE, data});
                dispatch({type: UPDATE_SURVEY_LIST, data});
                dispatch({type: IS_LOADING, isLoading: false});
            })
            .catch(function (error) {
                dispatch({type: IS_LOADING, isLoading: false});
                console.error(error);
            });
    };
};

export const storeSurveyList = (surveyId) => {
    return (dispatch, getStates, getFirebase) => {
        try {
            dispatch({type: IS_LOADING, isLoading: true});
            getSurveys()
                .then((res) => {
                    let surveyList = [];
                    res.forEach((doc) => {
                        let survey = doc.data;
                        survey.id = doc.id;
                        surveyList.push(survey);
                    });
                    surveyList = surveyList.sort((a, b) =>
                        compareDesc(
                            new Date(a.dateCreated),
                            new Date(b.dateCreated)
                        )
                    );
                    let data = surveyList;
                    dispatch({type: STORE_SURVEY_LIST, data: data});
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

export const newSurvey = (data) => {
    return (dispatch, getStates, getFirebase) => {
        dispatch({type: ADD_TO_SURVEY_LIST, data});
    };
};

export const removeSurvey = (questionnaireId) => {
    return (dispatch, getStates, getFirebase) => {
        let data = {questionnaireId: questionnaireId};
        dispatch({type: REMOVE_FROM_SURVEY_LIST, data});
    };
};
