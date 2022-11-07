import {
    SURVEY,
    SURVEY_UPDATE,
    STORE_SURVEY_LIST,
    UPDATE_SURVEY_LIST,
    REMOVE_FROM_SURVEY_LIST,
    ADD_TO_SURVEY_LIST,
    IS_LOADING
} from "./types";
import { getSurvey, editSurvey, getSurveys, getQuestionnaires, editQuestionnaire } from "../../utils/API";
import { isEmptyObject } from "../../utils/Utils";
import { compareDesc } from "date-fns";
import { cloneDeep } from "lodash";

export const storeSurvey = (surveyId) => {
    return (dispatch, getStates, getFirebase) => {
        getSurvey(surveyId)
            .then((doc) => {
                let data = doc.data;
                data = { ...data, id: surveyId };
                if (!isEmptyObject(data)) {
                    dispatch({ type: SURVEY, data });
                }
            })
            .catch(function (error) {
                console.error("Error getting documents: ", error);
            });
    };
};

export const updateSurvey = (surveyId, survey) => {
    return (dispatch, getStates, getFirebase) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        const updatedSurvey = cloneDeep(survey);
        delete updatedSurvey.id;
        editSurvey(surveyId, updatedSurvey)
            .then(() => {
                const data = { ...updatedSurvey, id: surveyId };
                dispatch({ type: SURVEY_UPDATE, data });
                dispatch({ type: UPDATE_SURVEY_LIST, data });
                dispatch({ type: IS_LOADING, isLoading: false });
            })
            .catch(function (error) {
                dispatch({ type: IS_LOADING, isLoading: false });
                console.error(error);
            });
    };
};

export const disableScheduledJobs = (questionnaireId, survey) => {
    return (dispatch, getStates, getFirebase) => {
        if (survey.scheduledJobs) {
            survey.scheduledJobs.forEach((job) => {
                if (
                    job.questionnaireToJoin === questionnaireId ||
                    job.questionnaireCompleted === questionnaireId
                ) {
                    job.enabled = false;
                }
            });
            updateSurvey(survey.id, survey);
        }
    };
};

export const updateQuestionnairesPublicStatusForSurvey = (surveyId, publicStatus) => {
    return (dispatch, getStates, getFirebase) => {
        getQuestionnaires(surveyId)
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    const questionnaireId = doc.id;
                    const questionnaire = doc.data;
                    if (!isEmptyObject(publicStatus) && questionnaire.public !== publicStatus) {
                        questionnaire.public = publicStatus;
                        editQuestionnaire(questionnaireId, { public: publicStatus });
                    }
                });
            })
            .catch((err) => {
                console.error(`error updating questionnaire public status: ${err}`);
            });
    };
};

export const storeSurveyList = (surveyId) => {
    return (dispatch, getStates, getFirebase) => {
        try {
            dispatch({ type: IS_LOADING, isLoading: true });
            getSurveys()
                .then((res) => {
                    const surveyList = [];
                    res.forEach((doc) => {
                        const survey = doc.data;
                        survey.id = doc.id;
                        surveyList.push(survey);
                    });
                    surveyList.sort((a, b) => compareDesc(new Date(a.dateCreated), new Date(b.dateCreated)));
                    const data = surveyList;
                    dispatch({ type: STORE_SURVEY_LIST, data: data });
                    dispatch({ type: IS_LOADING, isLoading: false });
                })
                .catch((err) => {
                    console.error("Error getting documents", err);
                    dispatch({ type: IS_LOADING, isLoading: false });
                });
        } catch (err) {
            console.error(err);
            dispatch({ type: IS_LOADING, isLoading: false });
        }
    };
};

export const newSurvey = (data) => {
    return (dispatch, getStates, getFirebase) => {
        dispatch({ type: ADD_TO_SURVEY_LIST, data });
    };
};

export const removeSurvey = (questionnaireId) => {
    return (dispatch, getStates, getFirebase) => {
        let data = { questionnaireId: questionnaireId };
        dispatch({ type: REMOVE_FROM_SURVEY_LIST, data });
    };
};
