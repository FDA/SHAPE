import {
    APPLICATION_READY,
    CLEAR_ACTIVE_PROFILE,
    Q13_ANSWER,
    SET_Q13_VIEW,
    Q13_ANSWER_QUERY,
    Q13_ANSWER_WRITE,
    Q13_ANSWERS_FROM_COLLECTION,
    Q13_QUERY,
    Q13_QUERY_RESET,
    Q13_RESET,
    Q13_RESPONSE_RESET,
    Q13_STACK_POP,
    Q13_STACK_PUSH,
    SET_ACTIVE_PROFILE,
    SURVEY_INFORMED_CONSENT,
    SURVEY_INFORMED_CONSENT_AGREED,
    SURVEY_INFORMED_CONSENT_RESET,
    SURVEY_QUERY,
    SURVEY_RESET,
    JOIN_SUCCESS
} from '../actions/types';
import {
    Questionnaire,
    InformedConsent,
    Survey,
    Person,
    ParticipantResponse,
    Response,
    QuestionnaireQuestion
} from '../../interfaces/DataTypes';

const questionnaireData: Array<any> = [];
const questionnairesState: Array<any> = [];

const initialState = questionnaireData ? questionnaireData : { questionStack: [] };
const initialResponseState: Array<any> = [];

export function questionnaires(
    state: any = questionnairesState,
    action: { type: string; q13Array: Questionnaire }
) {
    switch (action.type) {
        case Q13_QUERY: {
            const { q13Array } = action;
            return q13Array;
        }
        case Q13_QUERY_RESET:
            return [];
        default:
            return state;
    }
}

export function questionnaireView(state = 'todo', action: { type: string; view: string }) {
    switch (action.type) {
        case SET_Q13_VIEW: {
            const { view } = action;
            return view;
        }
        default:
            return state;
    }
}

export function applicationReady(state = false, action: { type: string; isReady: boolean | undefined }) {
    switch (action.type) {
        case APPLICATION_READY: {
            let { isReady } = action;
            if (isReady === undefined) isReady = true;
            return isReady;
        }
        default:
            return state;
    }
}

export function consent(
    state: any = [],
    action: { type: string; informedConsent: InformedConsent; payload: any }
) {
    switch (action.type) {
        case SURVEY_INFORMED_CONSENT: {
            const { informedConsent } = action;
            return informedConsent;
        }
        case SURVEY_INFORMED_CONSENT_AGREED:
            state.push(action.payload);
            return state;
        case SURVEY_INFORMED_CONSENT_RESET:
            state = [];
            return state;
        default:
            return state;
    }
}

export function surveys(state: any = [], action: { type: string; data: Array<Survey> }) {
    switch (action.type) {
        case SURVEY_QUERY: {
            const { data } = action;
            return data;
        }
        case SURVEY_RESET:
            return [];
        default:
            return state;
    }
}

export function selectedProfile(state: any = {}, action: { type: string; data: Person }) {
    switch (action.type) {
        case SET_ACTIVE_PROFILE:
            return action.data;
        case CLEAR_ACTIVE_PROFILE:
            return {};

        default:
            return state;
    }
}

export function questionnaire(
    state: any = initialState,
    action: {
        type: string;
        answer: ParticipantResponse;
        responses: Array<Response>;
        question: QuestionnaireQuestion;
    }
) {
    const { questionStack } = state;
    switch (action.type) {
        case Q13_ANSWER: {
            const answer = action.answer;
            return { ...state, ...answer };
        }
        case Q13_ANSWERS_FROM_COLLECTION: {
            const responses = action.responses ? action.responses : [];
            const responseState: any = [];
            responses.forEach((r: Response) => {
                const q = r['question'];
                responseState[q] = r['response'];
            });
            responseState.questionStack = [];
            return { ...state, ...responseState };
        }
        case Q13_RESET:
            return { questionStack: [] };

        case Q13_STACK_PUSH: {
            const question = action.question;
            questionStack.push(question);
            return { ...state, questionStack };
        }
        case Q13_STACK_POP:
            questionStack.pop();
            return { ...state, questionStack };

        default:
            return state;
    }
}

export function participantResponse(state = initialResponseState, action: { type: string; data: any }) {
    switch (action.type) {
        case Q13_ANSWER_QUERY:
            try {
                const actionData = action.data;
                const cached: Array<ParticipantResponse> = [];
                actionData.forEach((row: { id: string; data: ParticipantResponse }) => {
                    const rowData = row.data;
                    const {
                        responses,
                        dateWritten,
                        profile,
                        questionnaireId,
                        surveyId,
                        participantId,
                        complete,
                        org,
                        profileDOB,
                        profileId,
                        userId,
                        systemGenerated,
                        systemGeneratedType
                    } = rowData;
                    const { id } = row;
                    cached.push({
                        responses: responses,
                        surveyId: surveyId,
                        questionnaireId: questionnaireId,
                        participantId: participantId,
                        profile: profile,
                        dateWritten: dateWritten,
                        id: id,
                        complete: complete,
                        org: org,
                        profileDOB: profileDOB,
                        profileId: profileId,
                        userId: userId,
                        systemGenerated: systemGenerated,
                        systemGeneratedType: systemGeneratedType
                    });
                });
                return cached;
            } catch (e) {
                console.error(e); // this will fall through as initial state if fetch returned no result.
            }
            break;
        case Q13_ANSWER_WRITE: {
            const { data } = action;
            const stateData = JSON.stringify(state);
            const newState = JSON.parse(stateData);
            const previousAnswerIndex = newState.findIndex((item: ParticipantResponse) => {
                return (
                    data.surveyId === item.surveyId &&
                    data.questionnaireId === item.questionnaireId &&
                    data.participantId === item.participantId &&
                    item.profile === data.profile
                );
            });

            if (previousAnswerIndex > -1) {
                newState[previousAnswerIndex] = data;
            } else {
                newState.push(data);
            }
            return newState;
        }
        case Q13_RESPONSE_RESET:
            return initialResponseState;
        default:
            return state;
    }
}

export function joinSuccess(state = false, action: { type: string; success: boolean }) {
    switch (action.type) {
        case JOIN_SUCCESS:
            return action.success;
        default:
            return state;
    }
}
