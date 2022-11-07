import {
    APPLICATION_READY,
    Q13_ANSWER,
    Q13_ANSWER_WRITE,
    Q13_ANSWERS_FROM_COLLECTION,
    Q13_QUERY,
    Q13_RESET,
    Q13_STACK_POP,
    Q13_STACK_PUSH,
    SET_ACTIVE_PROFILE,
    SURVEY_INFORMED_CONSENT_AGREED,
    SET_PREVIEW_ORG,
    IS_LOADING,
    JOIN_SUCCESS,
    SET_ORG,
    PARTICIPANT_LOOKUP_RESET,
    RESET_ORG,
    RESET_PUBLIC_SURVEY,
    SET_Q13_VIEW
} from './types';
import { batch } from 'react-redux';
import {
    Answer,
    Target,
    ParticipantResponse,
    QuestionnaireQuestion,
    Person,
    Questionnaire,
    Response,
    ParticipantObject
} from '../../interfaces/DataTypes';
import { collections, environments, firebaseFunctions } from '../../utils/Constants';
import { Context } from '../../question/engine/Context';
import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    query,
    QuerySnapshot,
    setDoc,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

export const answerQuestion = (answer: Answer) => {
    return (dispatch: Function) => {
        dispatch({ type: Q13_ANSWER, answer });
    };
};

export const initializeQuestionnaire = (target: Target, participantResponse: Array<ParticipantResponse>) => {
    return (dispatch: Function) => {
        let responses: Array<Response> = [];
        const previousAnswers = participantResponse.find((item) => {
            const { surveyId, questionnaireId } = target;
            return (
                surveyId === item.surveyId &&
                questionnaireId === item.questionnaireId &&
                item.profile === target.profileName
            );
        });
        if (previousAnswers) {
            responses = previousAnswers.responses;
        }
        dispatch({ type: Q13_ANSWERS_FROM_COLLECTION, responses });
    };
};

export const pushQuestion = (question: QuestionnaireQuestion) => {
    return (dispatch: Function) => {
        dispatch({ type: Q13_STACK_PUSH, question });
    };
};

export const popQuestion = () => {
    return (dispatch: Function) => {
        dispatch({ type: Q13_STACK_POP });
    };
};

export const setReadyState = (newState: boolean) => {
    return (dispatch: Function) => {
        dispatch({ type: APPLICATION_READY, newState });
    };
};

export const setActiveProfile = (data: Person) => {
    return (dispatch: Function) => {
        dispatch({ type: SET_ACTIVE_PROFILE, data });
    };
};

export const joinPublicSurvey = () => {
    return (dispatch: Function, getStates: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        const firestore = getFirestore();
        const state = getStates();
        const { id } = state.selectedPublicSurvey;
        const userId = state.firebase.auth.uid;

        const docRef = doc(firestore, collections.SURVEY, id);
        updateDoc(docRef, { participants: arrayUnion(userId) })
            .then(() => {
                dispatch({ type: IS_LOADING, isLoading: false });
                dispatch({ type: JOIN_SUCCESS, success: true });
                dispatch({ type: PARTICIPANT_LOOKUP_RESET });
                dispatch({ type: RESET_ORG });
                dispatch({ type: RESET_PUBLIC_SURVEY });
            })
            .catch((error: any) => {
                console.error('Error adding participant to public survey: ', error);
                dispatch({ type: IS_LOADING, isLoading: false });
                dispatch({ type: JOIN_SUCCESS, success: false });
            });
    };
};

export const joinOrg = () => {
    return (dispatch: Function, getStates: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        dispatch({ type: APPLICATION_READY, isReady: true });
        const firestore = getFirestore();
        const state = getStates();
        const participantId = state.participant.participantId;
        const org = state.participant.org;
        const userId = state.firebase.auth.uid;

        const q = query(
            collection(firestore, collections.PARTICIPANT),
            where('org', '==', org),
            where('participantId', '==', participantId),
            where('public', '==', true)
        );
        getDocs(q)
            .then((querySnapshot: QuerySnapshot) => {
                return new Promise<void>((resolve) => {
                    // should only return one
                    querySnapshot.forEach((document: any) => {
                        const docRef = doc(firestore, collections.PARTICIPANT, document.id);
                        setDoc(docRef, { public: false, userId: userId }, { merge: true })
                            .then(() => {
                                const userDocRef = doc(firestore, collections.USERS, userId);
                                updateDoc(userDocRef, {
                                    participantId: arrayUnion({ org: org, id: participantId }),
                                    org: arrayUnion(org)
                                }).then(() => {
                                    dispatch({ type: IS_LOADING, isLoading: false });
                                    dispatch({ type: JOIN_SUCCESS, success: true });
                                    dispatch({ type: PARTICIPANT_LOOKUP_RESET });
                                    dispatch({ type: RESET_ORG });
                                    dispatch({ type: RESET_PUBLIC_SURVEY });
                                    resolve();
                                });
                            })
                            .catch((err: any) => {
                                console.error(`Unable to update the participant record ${err}`);
                                dispatch({ type: IS_LOADING, isLoading: false });
                                dispatch({ type: JOIN_SUCCESS, success: false });
                                resolve();
                            });
                    });
                });
            })
            .catch((err: any) => {
                console.error(`Unable to update participant info ${err}`);
                dispatch({ type: IS_LOADING, isLoading: false });
                dispatch({ type: JOIN_SUCCESS, success: false });
            });
    };
};

export const toggleJoinSuccess = (success: boolean) => {
    return (dispatch: Function) => {
        dispatch({ type: JOIN_SUCCESS, success: success });
    };
};

export const agreeToInformedConsent = (
    participantId: string,
    surveyId: string,
    email: string,
    org: string,
    userId: string
) => {
    return (dispatch: Function) => {
        const firestore = getFirestore();

        const docData = {
            participantId: participantId,
            org: org,
            surveyId: surveyId,
            emailSent: email,
            dateAgreed: Timestamp.fromDate(new Date()),
            userId: userId
        };

        const collectionRef = collection(firestore, collections.INFORMED_CONSENT);
        addDoc(collectionRef, docData)
            .then(async () => {
                if (process.env.NODE_ENV === environments.DEVELOPMENT)
                    console.log('Document successfully written!');
                dispatch({
                    type: SURVEY_INFORMED_CONSENT_AGREED,
                    payload: docData
                });
                const url = `${process.env.REACT_APP_BASE_URL}/${firebaseFunctions.SENDMAIL}`;
                const headers = {
                    'Content-Type': 'application/json'
                };
                const body = {
                    recipient: email,
                    surveyId: surveyId
                };

                return fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body),
                    mode: 'cors'
                });
            })
            .catch((error: any) => {
                console.error('Error getting informed consents: ', error);
            });
    };
};

export const completeQuestionnaire = (context: Context, completeStatus = false) => {
    return (dispatch: Function, getStates: Function) => {
        if (process.env.NODE_ENV === environments.DEVELOPMENT) console.log('completeQuestionnaire');
        const firestore = getFirestore();
        const state = getStates();
        let isNew = true;
        const { questionnaire, participantResponse } = state;
        const docData: ParticipantResponse = {
            id: context.id,
            participantId: context.participant,
            org: context.org,
            profile: context.profile.name,
            profileDOB: context.profile.dob,
            profileId: context.profile.id,
            questionnaireId: context.questionnaire,
            surveyId: context.survey,
            responses: [],
            dateWritten: Timestamp.fromDate(new Date()),
            complete: completeStatus,
            userId: state.firebase.auth.uid
        };

        const saveTemplate = JSON.stringify(questionnaire);
        const saveObject = JSON.parse(saveTemplate); // deep copy
        delete saveObject.questionStack;
        for (const entry of Object.entries(saveObject)) {
            if (entry[1] !== undefined) {
                const response: Response = {
                    question: entry[0],
                    response: entry[1] as string
                };
                docData.responses.push(response);
            }
        }

        const previousAnswers = participantResponse.find((item: ParticipantResponse) => {
            dispatch(setReadyState(false));
            return (
                docData.surveyId === item.surveyId &&
                docData.questionnaireId === item.questionnaireId &&
                docData.participantId === item.participantId &&
                item.profile === docData.profile
            );
        });
        if (previousAnswers) {
            isNew = false;
            docData.id = previousAnswers.id;
        }
        if (isNew) {
            const collectionRef = collection(firestore, collections.PARTICIPANT_RESPONSE);
            addDoc(collectionRef, docData)
                .then((docRef: any) => {
                    if (process.env.NODE_ENV === environments.DEVELOPMENT)
                        console.log('Document successfully created!!');
                    docData.id = docRef.id;
                    dispatch(setReadyState(true));
                })
                .catch((err: any) => {
                    console.error(`Unable to st response info ${err}`);
                });
        } else {
            const docRef = doc(firestore, collections.PARTICIPANT_RESPONSE, docData.id);
            setDoc(docRef, docData)
                .then(() => {
                    if (process.env.NODE_ENV === environments.DEVELOPMENT)
                        console.log('Document successfully written!');
                    dispatch(setReadyState(true));
                })
                .catch((err: any) => {
                    console.error(`Unable to set participant response info ${err}`);
                });
        }
        batch(() => {
            dispatch(resetQuestionnaire());
            dispatch(mergeParticipantAnswers(docData));
        });
    };
};

const mergeParticipantAnswers = (docData: ParticipantResponse) => {
    return (dispatch: Function) => {
        dispatch({ type: Q13_ANSWER_WRITE, data: docData });
    };
};

export const resetQuestionnaire = () => {
    return (dispatch: Function) => {
        if (process.env.NODE_ENV === environments.DEVELOPMENT) console.log('Requesting Q13_RESET');
        dispatch({ type: Q13_RESET });
    };
};

const processQuestionnaires = (querySnapshot: QuerySnapshot) => {
    const data: Array<Questionnaire> = [];
    querySnapshot.forEach((document: any) => {
        let q13 = document.data();
        delete q13.participants;
        q13 = { ...q13, id: document.id };
        data.push(q13);
    });
    return data;
};

export const getQuestionnaires = (participantId: Array<ParticipantObject>) => {
    return (dispatch: Function, getStates: Function) => {
        const q13Array: Array<Questionnaire> = [];
        const questionnairePromises: Array<Promise<void>> = [];
        const firestore = getFirestore();
        const state = getStates();
        const userId = state.firebase.auth.uid;
        for (const index in participantId) {
            const participant = participantId[index].id;
            const org = participantId[index].org;
            const q = query(
                collection(firestore, collections.QUESTIONNAIRE),
                where('participants', 'array-contains', participant),
                where('org', '==', org),
                where('archived', '==', false),
                where('locked', '==', true) // only return open and closed (no draft or archived)
            );
            const privateQuestionnairePromise = new Promise<void>((res: any) => {
                getDocs(q)
                    .then(function (querySnapshot: any) {
                        querySnapshot.forEach(function (privateQuestionnaireDoc: any) {
                            let q13 = privateQuestionnaireDoc.data();
                            delete q13.participants;
                            q13 = { ...q13, id: privateQuestionnaireDoc.id };
                            q13Array.push(q13);
                        });
                        res();
                    })
                    .catch(() => {
                        res();
                    });
            });
            questionnairePromises.push(privateQuestionnairePromise);
        }
        //get all public questionnaires

        const publicQuestionnairePromise = new Promise<void>((res) => {
            const q = query(
                collection(firestore, collections.QUESTIONNAIRE),
                where('participants', 'array-contains', userId),
                where('archived', '==', false),
                where('locked', '==', true) // only return open and closed (no draft or archived)
            );
            getDocs(q)
                .then((querySnapshot: QuerySnapshot) => {
                    querySnapshot.forEach((document: any) => {
                        let q13 = document.data();
                        delete q13.participants;
                        q13 = { ...q13, id: document.id };
                        q13Array.push(q13);
                    });
                    res();
                })
                .catch((error: any) => {
                    console.error('Error getting questionnaires: ', error);
                    res();
                });
        });

        questionnairePromises.push(publicQuestionnairePromise);
        Promise.all(questionnairePromises)
            .then(() => {
                dispatch({ type: Q13_QUERY, q13Array });
            })
            .catch((err: any) => {
                console.error(err);
            });
    };
};

export const getAllPreviewQuestionnaires = (surveyId: string) => {
    return (dispatch: Function) => {
        const firestore = getFirestore();
        const q = query(collection(firestore, collections.QUESTIONNAIRE), where('surveyId', '==', surveyId));
        getDocs(q)
            .then((querySnapshot: QuerySnapshot) => {
                const q13Array = processQuestionnaires(querySnapshot);
                dispatch({ type: Q13_QUERY, q13Array });
            })
            .catch((error: any) => {
                if (process.env.NODE_ENV === environments.DEVELOPMENT)
                    console.log('Error getting preview questionnaires: ', error);
            });
    };
};

export const setOrg = (org: string) => {
    return (dispatch: Function) => {
        dispatch({ type: SET_ORG, org });
    };
};

export const setQuestionnaireView = (view: string) => {
    return (dispatch: Function) => {
        dispatch({ type: SET_Q13_VIEW, view });
    };
};

export const getOnePreviewQuestionnaire = (questionnaireId: string, refreshToken: string) => {
    return (dispatch: Function) => {
        const fbFunctions = getFunctions();
        const auth = getAuth();
        const firestore = getFirestore();
        const getPreviewToken = httpsCallable(fbFunctions, firebaseFunctions.GETPREVIEWTOKEN);
        //@ts-ignore
        getPreviewToken({ token: refreshToken }, null)
            .then((result: { data: any }) => {
                const { data } = result;
                const { customToken, org } = data;
                signInWithCustomToken(auth, customToken)
                    .then(() => {
                        dispatch({ type: SET_PREVIEW_ORG, org });
                        const docRef = doc(firestore, collections.QUESTIONNAIRE, questionnaireId);
                        getDoc(docRef)
                            .then((document: any) => {
                                const q13Array: Array<Questionnaire> = [];
                                let q13 = document.data();
                                delete q13.participants;
                                q13 = { ...q13, id: document.id };
                                q13Array.push(q13);
                                dispatch({ type: Q13_QUERY, q13Array });
                            })
                            .catch((error: any) => {
                                console.error('Error getting preview questionnaires: ', error);
                            });
                    })
                    .catch((err: any) => {
                        console.error(`Unable to sign in with custom token ${err}`);
                    });
            })
            .catch((err: any) => {
                console.error(`Unable to fetch custom token ${err}`);
            });
    };
};
