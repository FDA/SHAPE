import {
    Org,
    Participant,
    Questionnaire,
    QuestionnaireQuestion,
    Question,
    Survey,
    User
} from '../interfaces/DataTypes';
import {guid, isEmptyObject} from './Utils';
import {dateFormats} from './Constants';
import {generate} from 'generate-password';
import {format} from 'date-fns';
import firebaseConfig from '../config/firebase.json';

const firebase = require('firebase');
require('firebase/firestore');

export async function getNotifications() {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/message`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export function getEnvVar(data: any, context: any) {
    let getVar = firebase.functions().httpsCallable('getEnvVar');
    return getVar(data, context);
}

export function sendNotification(
    subject: string,
    message: string,
    deviceTokens: any[]
) {
    let url = `${process.env.REACT_APP_BASE_URL}/sendNotification`;
    const headers = {
        'Content-Type': 'application/json'
    };
    let body = {
        message: {
            notification: {
                title: subject,
                body: message
            },
            tokens: deviceTokens
        }
    };

    fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
        mode: 'cors'
    }).catch((err: any) => {
        console.error(err);
    });
}

export async function getUserInfo(uid: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/user/${uid}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function createUser(uid: string, user: User) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/user/${uid}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(user)
    });
}

export async function addNotificationToDatabase(d: any) {
    let data = {...d};

    data.emailRecipients = data.emailRecipients.map((recipient: any) => {
        return recipient.participantId;
    });

    data.smsRecipients = data.smsRecipients.map((recipient: any) => {
        return recipient.participantId;
    });

    data.pushRecipients = data.pushRecipients.map((recipient: any) => {
        return recipient.participantId;
    });

    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/message`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });
}

export function sendEmailNotification(data: any) {
    var sendEmailNotificationFunction = firebase
        .functions()
        .httpsCallable('sendEmailNotification');
    return sendEmailNotificationFunction(data);
}

export function sendTextNotification(
    subject: any,
    message: any,
    numbers: string[]
) {
    let url = `${process.env.REACT_APP_BASE_URL}/sendSms`;
    const headers = {
        'Content-Type': 'application/json'
    };
    let body = {
        subject: subject,
        message: message,
        phoneNumbers: numbers
    };

    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
        mode: 'cors'
    });
}

export function disableUser(uid: string) {
    var disableUserFunction = firebase.functions().httpsCallable('disableUser');
    return disableUserFunction({uid: uid});
}

export function enableUser(uid: string) {
    var enableUserFunction = firebase.functions().httpsCallable('enableUser');
    return enableUserFunction({uid: uid});
}

export async function storeImage(image: any) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/image`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(image)
    });
}

export async function getImage(storageId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/image/${storageId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getAllImageMetadata() {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/image`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function createQuestionnaire(questionnaire: Questionnaire) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/questionnaire`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(questionnaire)
    });
}

export async function getQuestionnaires(surveyId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/questionnaire/query`;
    let query = {
        query: [
            {
                key: 'surveyId',
                operator: '==',
                value: surveyId
            },
            {
                key: 'archived',
                operator: '==',
                value: false
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function deleteQuestionnaire(questionnaireId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem(
        'apiUrl'
    )}/questionnaire/${questionnaireId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'DELETE',
        headers: headers
    });
}

export async function deleteSurvey(surveyId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/survey/${surveyId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'DELETE',
        headers: headers
    });
}

export async function getOpenQuestionnaires(surveyId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/questionnaire/query`;
    let query = {
        query: [
            {
                key: 'surveyId',
                operator: '==',
                value: surveyId
            },
            {
                key: 'archived',
                operator: '==',
                value: false
            },
            {
                key: 'open',
                operator: '==',
                value: true
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getQuestionnaire(questionnaireId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem(
        'apiUrl'
    )}/questionnaire/${questionnaireId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getQuestionnaireResponses(questionnaireId: any) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/participant-response/query`;
    let query = {
        query: [
            {
                key: 'questionnaireId',
                operator: '==',
                value: questionnaireId
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getParticipantResponses(
    surveyId: any,
    participantId: any
) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/participant-response/query`;
    let query = {
        query: [
            {
                key: 'surveyId',
                operator: '==',
                value: surveyId
            },
            {
                key: 'participantId',
                operator: '==',
                value: participantId
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getDiaryResponses(id: any) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/participant-diary/query`;
    let query = {
        query: [
            {
                key: 'surveyId',
                operator: '==',
                value: id
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getEnrolledQuestionnaires(
    surveyId: any,
    participantId: any
) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/questionnaire/query`;
    let query = {
        query: [
            {
                key: 'surveyId',
                operator: '==',
                value: surveyId
            },
            {
                key: 'participants',
                operator: 'array-contains',
                value: participantId
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function editQuestionnaire(questionnaireId: string, changes: any) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem(
        'apiUrl'
    )}/questionnaire/${questionnaireId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };

    return fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(changes)
    });
}

export async function createParticipant(participant: Participant) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/participant`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(participant)
    });
}

export async function getParticipant(participantId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem(
        'apiUrl'
    )}/participant?participantId=${participantId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getAllParticipants() {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/participant/`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getUser(participantId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem(
        'apiUrl'
    )}/user?participantId=${participantId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getActiveUser(participantId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/user/query`;
    let query = {
        query: [
            {
                key: 'participantId',
                operator: '==',
                value: participantId
            },
            {
                key: 'active',
                operator: '==',
                value: true
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getActiveUsers() {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/user/query`;
    let query = {
        query: [
            {
                key: 'active',
                operator: '==',
                value: true
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function editUser(userId: string, changes: any) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/user/${userId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };

    return fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(changes)
    });
}

export async function getProfiles(participantList: any) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/user/query`;
    let query = {
        query: [
            {
                key: 'participantId',
                operator: '==',
                value: participantList
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function createSurvey(survey: Survey) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/survey`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(survey)
    });
}

export async function getSurveys() {
    // allows token to load on app refresh
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(async (user: any) => {
            if (user) {
                const tken = await user.getIdToken();
                let url = `${localStorage.getItem('apiUrl')}/survey/query`;
                let query = {
                    query: [
                        {
                            key: 'archived',
                            operator: '==',
                            value: false
                        }
                    ]
                };
                const headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tken}`
                };
                fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(query)
                })
                    .then((res: any) => res.json())
                    .then((data: any) => {
                        resolve(data.DATA);
                    })
                    .catch((e: any) => {
                        console.error(e);
                        reject('authentication failed');
                    });
            } else {
                reject('not logged in');
            }
        });
    });
}

export async function getSurvey(surveyId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    const apiUrl = `${localStorage.getItem('apiUrl')}/survey/${surveyId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    const result = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
    });
    if (result) {
        const data = await result.json();
        return data.DATA;
    } else {
        console.log(`No Data returned for query.`);
        return [];
    }
}

export async function editSurvey(surveyId: string, changes: any) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/survey/${surveyId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };

    return fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(changes)
    });
}

export async function createQuestionTemplate(question: Question) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/question`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(question)
    });
}

export async function getQuestionTemplates() {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    const apiUrl = `${localStorage.getItem('apiUrl')}/question`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    const result = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
    });
    if (result) {
        const data = await result.json();
        return data.DATA;
    } else {
        return [];
    }
}

export async function editQuestionTemplate(question: QuestionnaireQuestion) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let questionId = question.id;
    delete question.id;
    delete question.order;
    let url = `${localStorage.getItem('apiUrl')}/question/${questionId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };

    return fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(question)
    });
}

export async function deleteQuestionTemplate(questionId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/question/${questionId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'DELETE',
        headers: headers
    });
}

async function getInbox(participantId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem(
        'apiUrl'
    )}/inbox?participantId=${participantId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function createInbox(participantId: string, message: any) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/inbox`;
    let body = {participantId: participantId};
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });
}

async function editInbox(docId: string, inbox: any) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/inbox/${docId}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };

    return fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(inbox)
    });
}

export function sendToInbox(
    subject: string,
    message: string,
    timestamp: string,
    participantIds: any[],
    deviceTokens: any[]
) {
    let id = guid();
    let record = {
        subject: subject,
        message: message,
        timestamp: timestamp,
        read: false,
        id: id
    };

    sendNotification(subject, message, deviceTokens);

    participantIds.forEach((participantId: string) => {
        return new Promise((resolve: any, reject: any) => {
            getInbox(participantId)
                .then((res: any) => {
                    if (res.length > 0) {
                        let docId = res[0].id;
                        let data = res[0].data;
                        let messages: any = !isEmptyObject(data)
                            ? data.messages
                            : [];
                        messages.push(record);

                        editInbox(docId, {messages: messages})
                            .then((r: any) => {
                                resolve();
                            })
                            .catch((e: any) => {
                                console.error(e);
                                resolve();
                            });
                    } else {
                        createInbox(participantId, record)
                            .then((r: any) => r.json())
                            .then((r: any) => {
                                editInbox(r.DATA.id, {messages: [record]})
                                    .then(() => {
                                        resolve();
                                    })
                                    .catch((e: any) => {
                                        console.error(e);
                                        resolve();
                                    });
                            })
                            .catch((e: any) => {
                                console.error(e);
                                resolve();
                            });
                    }
                })
                .catch((err: any) => {
                    console.error(err);
                });
        });
    });

    return Promise.all(participantIds);
}

export async function getAllEHRReceipts() {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/ehr`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getEHR(path: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/ehr/get`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    const body = {path: path};
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export function getAllOrgs() {
    const fireStore = firebase.firestore();
    return fireStore.collection('org').get();
}

export async function addOrg(org: Org) {
    const fireStore = firebase.firestore();
    return fireStore.collection('org').add(org);
}

export function updateOrg(docId: string, org: Org) {
    const fireStore = firebase.firestore();
    return fireStore.collection('org').doc(docId).set(org, {merge: true});
}

export async function checkUserExists(emailAddress: string) {
    const fbFunctions = firebase.functions();
    const checkUserExistsFunction = fbFunctions.httpsCallable(
        'checkUserExists'
    );
    const result = await checkUserExistsFunction({email: emailAddress});
    return {email: result.data.email, uid: result.data.uid};
}

export async function setAdmin(emailAddress: string, orgId: string) {
    const fbFunctions = firebase.functions();
    const setAdminFunction = fbFunctions.httpsCallable('setAdmin');
    return setAdminFunction({email: emailAddress, org: orgId});
}

export async function createAdminUser(org: Org) {
    const fireStore = firebase.firestore();
    const password = generate({
        length: 10,
        uppercase: true,
        lowercase: true,
        numbers: true
    });
    var secondaryApp = await firebase.initializeApp(firebaseConfig, guid());
    const createResult = await secondaryApp
        .auth()
        .createUserWithEmailAndPassword(org.adminEmail, password);
    secondaryApp.auth().signOut();
    let retVal = null;
    if (createResult) {
        try {
            await fireStore
                .collection('users')
                .doc(createResult.user.uid)
                .set({
                    id: org.id,
                    name: org.name,
                    contactName: org.contactName,
                    orgAdmin: true,
                    adminEmail: org.adminEmail,
                    active: org.active,
                    dateCreated: format(new Date(), dateFormats.MM_dd_yyyy),
                    userName: org.adminEmail,
                    org: org.id
                });
            await firebase.auth().sendPasswordResetEmail(org.adminEmail);
            retVal = true;
        } catch (e) {
            console.error(`Unable to create user ${org.adminEmail}`);
            retVal = false;
        }
    }
    return retVal;
}

export async function getDiaryJSONExport(surveyId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/export/diary`;
    let query = {
        query: [
            {
                key: 'surveyId',
                operator: '==',
                value: surveyId
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getDiaryFHIRExport(surveyId: string) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/export/diary/fhir`;
    let query = {
        query: [
            {
                key: 'surveyId',
                operator: '==',
                value: surveyId
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getQuestionnaireResponseJSONExport(
    questionnaireId: string
) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/export/questionnaire`;
    let query = {
        query: [
            {
                key: 'questionnaireId',
                operator: '==',
                value: questionnaireId
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}

export async function getQuestionnaireResponseFHIRExport(
    questionnaireId: string
) {
    const tken = await firebase.auth().currentUser.getIdToken(true);
    let url = `${localStorage.getItem('apiUrl')}/export/questionnaire/fhir`;
    let query = {
        query: [
            {
                key: 'questionnaireId',
                operator: '==',
                value: questionnaireId
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query)
    })
        .then((res: any) => res.json())
        .then((data: any) => {
            return data.DATA;
        });
}
