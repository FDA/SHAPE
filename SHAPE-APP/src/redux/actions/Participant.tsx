import {
    ACTIVE_PARTICIPANT,
    ADD_PARTICIPANT_NAMES,
    GET_DIARY_ENTRIES,
    IS_LOADING,
    PARTICIPANT_INBOX,
    PARTICIPANT_LOOKUP_FAILED,
    PARTICIPANT_LOOKUP_RESET,
    Q13_QUERY,
    Q13_RESET,
    SURVEY_INFORMED_CONSENT,
    SURVEY_QUERY,
    UPDATE_PARTICIPANT,
    APPLICATION_READY,
    GET_EHR_RECEIPTS,
    Q13_ANSWER_QUERY
} from './types';
import { registerForPush } from '../../utils/Utils';
import { batch } from 'react-redux';
import { isPlatform } from '@ionic/react';
import { environments, collections } from '../../utils/Constants';
import {
    Survey,
    Questionnaire,
    Diary,
    InformedConsent,
    ParticipantResponse,
    Inbox,
    EHRReceipt,
    Person,
    User
} from '../../interfaces/DataTypes';
import {
    collection,
    doc,
    getDocs,
    getFirestore,
    query,
    QuerySnapshot,
    setDoc,
    deleteDoc,
    where
} from 'firebase/firestore';

export const refreshAll = () => {
    return (dispatch: Function, getStates: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        const firestore = getFirestore();
        const state = getStates();
        const userId = state.firebase.auth.uid;
        const profile = state.firebase.profile;
        const participantId = profile.participantId;
        const pushEnabled = profile.pushEnabled;

        const resetQuestionnaire = new Promise<void>((resolve) => {
            dispatch({ type: Q13_RESET });
            resolve();
        });

        const getSurveys = new Promise<void>((resolve) => {
            const data: Array<Survey> = [];
            const surveyPromises: Array<Promise<void>> = [];
            for (const index in participantId) {
                const participant = participantId[index].id;
                const org = participantId[index].org;
                const privateSurveyPromise = new Promise<void>((res) => {
                    const privateSurveyQuery = query(
                        collection(firestore, collections.SURVEY),
                        where('org', '==', org),
                        where('participants', 'array-contains', participant),
                        where('open', '==', true)
                    );
                    getDocs(privateSurveyQuery)
                        .then(function (querySnapshot: any) {
                            querySnapshot.forEach(function (privateSurveyDoc: any) {
                                let survey = privateSurveyDoc.data();
                                delete survey.participants;
                                survey = { ...survey, id: privateSurveyDoc.id };
                                data.push(survey);
                            });
                            res();
                        })
                        .catch(() => {
                            res();
                        });
                });
                surveyPromises.push(privateSurveyPromise);
            }

            // get public surveys
            const publicSurveyQuery = query(
                collection(firestore, collections.SURVEY),
                where('participants', 'array-contains', userId),
                where('open', '==', true)
            );
            const publicSurveyPromise = new Promise<void>((res) => {
                getDocs(publicSurveyQuery)
                    .then(function (querySnapshot: any) {
                        querySnapshot.forEach(function (publicSurveyDoc: any) {
                            let survey = publicSurveyDoc.data();
                            delete survey.participants;
                            survey = { ...survey, id: publicSurveyDoc.id };
                            data.push(survey);
                        });
                        dispatch({ type: SURVEY_QUERY, data });
                        res();
                    })
                    .catch(function (error: any) {
                        console.error('Error getting surveys: ', error);
                        res();
                    });
            });

            surveyPromises.push(publicSurveyPromise);

            Promise.all(surveyPromises)
                .then(() => {
                    dispatch({ type: SURVEY_QUERY, data });
                    resolve();
                })
                .catch((err: any) => console.error(err));
        });

        const getQuestionnaires = new Promise<void>((resolve) => {
            const q13Array: Array<Questionnaire> = [];
            const questionnairePromises: Array<Promise<void>> = [];
            for (const index in participantId) {
                const participant = participantId[index].id;
                const org = participantId[index].org;
                const privateQuestionnaireQuery = query(
                    collection(firestore, collections.QUESTIONNAIRE),
                    where('participants', 'array-contains', participant),
                    where('org', '==', org),
                    where('archived', '==', false),
                    where('locked', '==', true)
                );
                const privateQuestionnairePromise = new Promise<void>((res: any) => {
                    getDocs(privateQuestionnaireQuery)
                        .then(function (querySnapshot: any) {
                            querySnapshot.forEach(function (questionnaireDoc: any) {
                                let q13 = questionnaireDoc.data();
                                delete q13.participants;
                                q13 = { ...q13, id: questionnaireDoc.id };
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
                const publicQuestionnaireQuery = query(
                    collection(firestore, collections.QUESTIONNAIRE),
                    where('participants', 'array-contains', userId),
                    where('archived', '==', false),
                    where('locked', '==', true)
                );
                getDocs(publicQuestionnaireQuery)
                    .then((querySnapshot: QuerySnapshot) => {
                        querySnapshot.forEach((publicQuestionnaireDoc: any) => {
                            let q13 = publicQuestionnaireDoc.data();
                            delete q13.participants;
                            q13 = { ...q13, id: publicQuestionnaireDoc.id };
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
                    resolve();
                })
                .catch((err: any) => {
                    console.error(err);
                    resolve();
                });
        });

        const getDiaryAvailability = new Promise<void>((resolve) => {
            const diaries: Array<Diary> = [];

            const diaryQuery = query(
                collection(firestore, collections.PARTICIPANT_DIARY),
                where('userId', '==', userId)
            );
            getDocs(diaryQuery)
                .then(function (querySnapshot: any) {
                    querySnapshot.forEach(function (diaryDoc: any) {
                        const diary = diaryDoc.data();
                        diaries.push(diary);
                    });
                    dispatch({ type: GET_DIARY_ENTRIES, diaries });
                    resolve();
                })
                .catch(() => {
                    resolve();
                });
        });

        const getInformedConsents = new Promise<void>((resolve) => {
            const informedConsent: Array<InformedConsent> = [];
            // for private informed consents
            const informedConsentQuery = query(
                collection(firestore, collections.INFORMED_CONSENT),
                where('userId', '==', userId)
            );
            getDocs(informedConsentQuery)
                .then((querySnapshot: QuerySnapshot) => {
                    querySnapshot.forEach((informedConsentDoc: any) => {
                        const data = informedConsentDoc.data();
                        informedConsent.push(data);
                    });
                    dispatch({ type: SURVEY_INFORMED_CONSENT, informedConsent });
                    resolve();
                })
                .catch((error: any) => {
                    console.error('Error getting informed consents: ', error);
                    resolve();
                });
        });

        const getCachedParticipantResponses = new Promise<void>((resolve) => {
            const data: Array<{ id: string; data: ParticipantResponse }> = [];
            // get private questionnaire responses
            const participantResponseQuery = query(
                collection(firestore, collections.PARTICIPANT_RESPONSE),
                where('userId', '==', userId)
            );
            getDocs(participantResponseQuery)
                .then((querySnapshot: QuerySnapshot) => {
                    querySnapshot.forEach((participantResponseDoc: any) => {
                        data.push({ id: participantResponseDoc.id, data: participantResponseDoc.data() });
                    });
                    dispatch({ type: Q13_ANSWER_QUERY, data });
                    resolve();
                })
                .catch((err: any) => {
                    console.error(`Unable to get participant response info ${err}`);
                    resolve();
                });
        });

        const loadParticipantInbox = new Promise<void>((resolve) => {
            const messages: Array<Inbox> = [];
            const inboxQuery = query(collection(firestore, collections.INBOX), where('userId', '==', userId));
            getDocs(inboxQuery)
                .then((querySnapshot: QuerySnapshot) => {
                    querySnapshot.forEach((inboxDoc: any) => {
                        const inboxMessage = inboxDoc.data();
                        inboxMessage.id = inboxDoc.id;
                        messages.push(inboxMessage);
                    });
                    dispatch({ type: PARTICIPANT_INBOX, inbox: messages });
                    resolve();
                })
                .catch((error: any) => {
                    console.error('Error getting public inbox messages: ', error);
                    resolve();
                });
        });

        const loadEHRReceipts = new Promise<void>((resolve) => {
            const ehrQuery = query(collection(firestore, collections.EHR), where('userId', '==', userId));
            getDocs(ehrQuery)
                .then((querySnapshot: QuerySnapshot) => {
                    let receipts: Array<EHRReceipt> = [];
                    querySnapshot.forEach((receiptDoc: any) => {
                        receipts = receipts.concat(receiptDoc.data().receipts);
                    });
                    dispatch({ type: GET_EHR_RECEIPTS, ehrReceipts: receipts });
                    resolve();
                })
                .catch((err: any) => {
                    console.error(`Unable to get ehr info ${err}`);
                    resolve();
                });
        });

        const promises = [
            resetQuestionnaire,
            getSurveys,
            getQuestionnaires,
            getDiaryAvailability,
            getCachedParticipantResponses,
            getInformedConsents,
            loadParticipantInbox,
            loadEHRReceipts
        ];

        Promise.all(promises)
            .then(() => {
                //Refresh device token
                if (pushEnabled && isPlatform('capacitor')) {
                    registerForPush(userId, (uid: string, token: string) => {
                        const docRef = doc(firestore, collections.USERS, uid);
                        setDoc(docRef, { token: token }, { merge: true }).catch((err: any) => {
                            console.error(err);
                        });
                    })
                        .then((res: boolean) => {
                            if (res === false) {
                                const docRef = doc(firestore, collections.USERS, userId);
                                setDoc(docRef, { pushEnabled: false }, { merge: true }).catch((err: any) => {
                                    console.error(err);
                                });
                                window.alert(
                                    "Push notifications are disabled for SHAPE on your phone. You can change this by modifying your device's notification settings."
                                );
                            }
                        })
                        .catch((err: any) => {
                            console.error(`Unable to set token info ${err}`);
                        });
                }
                batch(() => {
                    dispatch({ type: IS_LOADING, isLoading: false });
                    dispatch({ type: APPLICATION_READY, isReady: true });
                });
            })
            .catch((e) => {
                console.error(`Unable to fetch data`, e);
                batch(() => {
                    dispatch({ type: IS_LOADING, isLoading: false });
                    dispatch({ type: APPLICATION_READY, isReady: true });
                });
            });
    };
};

export const setEHRReceipts = () => {
    return (dispatch: Function, getStates: Function) => {
        const firestore = getFirestore();
        const state = getStates();
        const userId = state.firebase.auth.uid;

        const q = query(collection(firestore, collections.EHR), where('userId', '==', userId));
        getDocs(q)
            .then((querySnapshot: QuerySnapshot) => {
                let receipts: Array<EHRReceipt> = [];
                querySnapshot.forEach((document: any) => {
                    receipts = receipts.concat(document.data().receipts);
                });
                dispatch({ type: GET_EHR_RECEIPTS, ehrReceipts: receipts });
            })
            .catch((err: any) => {
                console.error(`Unable to get ehr info ${err}`);
            });
    };
};

export const participantInbox = () => {
    return (dispatch: Function, getStates: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        const firestore = getFirestore();
        const state = getStates();
        const userId = state.firebase.auth.uid;

        const messages: Array<Inbox> = [];

        const q = query(collection(firestore, collections.INBOX), where('userId', '==', userId));

        getDocs(q)
            .then((querySnapshot: QuerySnapshot) => {
                querySnapshot.forEach((inboxDoc: any) => {
                    const inboxMessage = inboxDoc.data();
                    inboxMessage.id = inboxDoc.id;
                    messages.push(inboxMessage);
                });
                dispatch({ type: PARTICIPANT_INBOX, inbox: messages });
                dispatch({ type: IS_LOADING, isLoading: false });
            })
            .catch((error: any) => {
                console.error('Error getting public inbox messages: ', error);
                dispatch({ type: IS_LOADING, isLoading: false });
            });
    };
};

export const markAsRead = (messageId: string) => {
    return (dispatch: Function, getStates: Function) => {
        const firestore = getFirestore();
        const inboxRef = doc(firestore, collections.INBOX, messageId);

        setDoc(inboxRef, { read: true }, { merge: true })
            .then(() => {
                dispatch({ type: IS_LOADING, isLoading: true });
                const state = getStates();
                const userId = state.firebase.auth.uid;

                const messages: Array<Inbox> = [];

                const q = query(collection(firestore, collections.INBOX), where('userId', '==', userId));

                getDocs(q)
                    .then((querySnapshot: QuerySnapshot) => {
                        querySnapshot.forEach((inboxDoc: any) => {
                            const inboxMessage = inboxDoc.data();
                            inboxMessage.id = inboxDoc.id;
                            messages.push(inboxMessage);
                        });
                        dispatch({ type: PARTICIPANT_INBOX, inbox: messages });
                        dispatch({ type: IS_LOADING, isLoading: false });
                    })
                    .catch((error: any) => {
                        console.error('Error getting public inbox messages: ', error);
                        dispatch({ type: IS_LOADING, isLoading: false });
                    });
            })
            .catch((err: any) => {
                console.error(`Unable to set messaged marked as read ${err}`);
            });
    };
};

export const deleteMessage = (messageId: string) => {
    return (dispatch: Function, getStates: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        const firestore = getFirestore();
        const inboxRef = doc(firestore, collections.INBOX, messageId);
        deleteDoc(inboxRef)
            .then(() => {
                dispatch({ type: IS_LOADING, isLoading: true });
                const state = getStates();
                const userId = state.firebase.auth.uid;

                const messages: Array<Inbox> = [];

                const q = query(collection(firestore, collections.INBOX), where('userId', '==', userId));

                getDocs(q)
                    .then((querySnapshot: QuerySnapshot) => {
                        querySnapshot.forEach((messageDoc: any) => {
                            const inboxMessage = messageDoc.data();
                            inboxMessage.id = messageDoc.id;
                            messages.push(inboxMessage);
                        });
                        dispatch({ type: PARTICIPANT_INBOX, inbox: messages });
                        dispatch({ type: IS_LOADING, isLoading: false });
                    })
                    .catch((error: any) => {
                        console.error('Error getting public inbox messages: ', error);
                        dispatch({ type: IS_LOADING, isLoading: false });
                    });
            })
            .catch((err: any) => {
                console.error(`Unable to get inbox info ${err}`);
            });
    };
};

export const updateParticipantDeviceToken = (userDocId: string, token: string) => {
    return () => {
        const firestore = getFirestore();
        const docRef = doc(firestore, collections.USERS, userDocId);
        setDoc(docRef, { token: token }, { merge: true })
            .then(() => {
                if (process.env.NODE_ENV === environments.DEVELOPMENT)
                    console.log(`token ${token} successfully stored for ${userDocId}`);
            })
            .catch((err: any) => {
                console.error(`Unable to set device token info ${err}`);
            });
    };
};

export const updateParticipant = (userDocId: string, profile: User) => {
    return (dispatch: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        try {
            const firestore = getFirestore();
            const docRef = doc(firestore, collections.USERS, userDocId);
            setDoc(docRef, profile, { merge: true })
                .then(() => {
                    dispatch({ type: IS_LOADING, isLoading: false });
                    dispatch({ type: UPDATE_PARTICIPANT, profile: profile });
                })
                .catch((err: any) => {
                    console.error(`Unable to update participant info ${err}`);
                });
        } catch (e) {
            console.error(`Error updating user preferences ${e}`);
        }
    };
};

export const addParticipantNames = (participants: Array<Person>) => {
    return (dispatch: Function) => {
        dispatch({ type: ADD_PARTICIPANT_NAMES, names: participants });
    };
};

export const resetparticipantLookup = () => {
    return (dispatch: Function) => {
        dispatch({ type: PARTICIPANT_LOOKUP_RESET });
    };
};

export const participantLookup = (participantId: string, org: string) => {
    if (process.env.NODE_ENV === environments.DEVELOPMENT)
        console.log(`Querying for patient: ${JSON.stringify(participantId)} from org ${org}`);
    return (dispatch: Function) => {
        dispatch({ type: IS_LOADING, isLoading: true });
        const firestore = getFirestore();
        const q = query(
            collection(firestore, collections.PARTICIPANT),
            where('org', '==', org),
            where('participantId', '==', participantId),
            where('public', '==', true)
        );
        getDocs(q)
            .then((querySnapshot: QuerySnapshot) => {
                //should only return one
                if (querySnapshot.empty) {
                    dispatch({ type: IS_LOADING, isLoading: false });
                    dispatch({ type: PARTICIPANT_LOOKUP_FAILED });
                } else {
                    querySnapshot.forEach((document: any) => {
                        const participant = document.data();
                        dispatch({ type: ACTIVE_PARTICIPANT, participant });
                        dispatch({ type: IS_LOADING, isLoading: false });
                    });
                }
            })
            .catch((err: any) => {
                console.error('Error getting participants: ', err);
                dispatch({ type: IS_LOADING, isLoading: false });
                dispatch({ type: PARTICIPANT_LOOKUP_FAILED });
            });
    };
};
