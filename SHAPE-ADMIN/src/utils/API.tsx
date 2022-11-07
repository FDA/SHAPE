import {
    Org,
    Participant,
    Questionnaire,
    QuestionnaireQuestion,
    Question,
    Survey,
    User,
    Inbox
} from '../interfaces/DataTypes';
import { guid } from './Utils';
import { dateFormats } from './Constants';
import { generate } from 'generate-password-browser';
import { format } from 'date-fns';
import firebaseConfig from '../config/firebase.json';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signOut
} from 'firebase/auth';
import { addDoc, collection, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

export async function getNotifications() {
    const tken = await getCurrentUserToken();
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
    const fbFunctions = getFunctions();
    const getVar = httpsCallable(fbFunctions, 'getEnvVar');
    //@ts-ignore
    return getVar(data, context);
}

export function sendNotification(subject: string, message: string, deviceTokens: any[]) {
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
    const tken = await getCurrentUserToken();
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
        })
        .catch((err: any) => {
            console.error(err);
            return err;
        });
}

export async function createUser(uid: string, user: User) {
    const tken = await getCurrentUserToken();
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

export async function addNotificationToDatabase(d: any, org: string, publicAccess: boolean) {
    let data = { ...d };

    if (publicAccess) {
        data.pushRecipients = data.pushRecipients.map((e: User) => e.docId);
        data.inAppRecipients = data.inAppRecipients.map((e: User) => e.docId);
        data.emailRecipients = data.emailRecipients.map((e: User) => e.docId);
        data.smsRecipients = data.smsRecipients.map((e: User) => e.docId);
    } else {
        data.pushRecipients = data.pushRecipients.map(
            (e: User) => e.participantId.filter((elem) => elem.org === org)[0].id
        );
        data.inAppRecipients = data.inAppRecipients.map(
            (e: User) => e.participantId.filter((elem) => elem.org === org)[0].id
        );
        data.emailRecipients = data.emailRecipients.map(
            (e: User) => e.participantId.filter((elem) => elem.org === org)[0].id
        );
        data.smsRecipients = data.smsRecipients.map(
            (e: User) => e.participantId.filter((elem) => elem.org === org)[0].id
        );
    }

    const tken = await getCurrentUserToken();
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
    const fbFunctions = getFunctions();
    var sendEmailNotificationFunction = httpsCallable(fbFunctions, 'sendEmailNotification');
    return sendEmailNotificationFunction(data);
}

export function sendTextNotification(subject: any, message: any, numbers: string[]) {
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

export async function storeImage(image: any) {
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
    let url = `${localStorage.getItem('apiUrl')}/questionnaire/${questionnaireId}`;
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
    let url = `${localStorage.getItem('apiUrl')}/questionnaire/${questionnaireId}`;
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
    const tken = await getCurrentUserToken();
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

export async function getParticipantResponses(surveyId: any, participantId: any) {
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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

export async function getEnrolledQuestionnaires(surveyId: any, participantId: any) {
    const tken = await getCurrentUserToken();
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

export async function editQuestionnaire(questionnaireId: string, changes: any) {
    const tken = await getCurrentUserToken();
    let url = `${localStorage.getItem('apiUrl')}/questionnaire/${questionnaireId}`;
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
    let url = `${localStorage.getItem('apiUrl')}/participant?participantId=${participantId}`;
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
    const tken = await getCurrentUserToken();
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

export async function getActiveUsers() {
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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
        const auth = getAuth();
        onAuthStateChanged(auth, async (user: any) => {
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
    const tken = await getCurrentUserToken();
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
        return [];
    }
}

export async function editSurvey(surveyId: string, changes: any) {
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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

export async function createInbox(record: Inbox) {
    const tken = await getCurrentUserToken();
    let url = `${localStorage.getItem('apiUrl')}/inbox`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(record)
    });
}

export function sendToInbox(
    subject: string,
    message: string,
    timestamp: string,
    users: User[],
    deviceTokens: string[],
    org: string
) {
    sendNotification(subject, message, deviceTokens);

    users.forEach((user: User) => {
        return new Promise<void>((resolve: any) => {
            let filteredId = user.participantId.filter((elem) => elem.org === org);
            let id = guid();
            let record = {
                subject: subject,
                message: message,
                timestamp: timestamp,
                read: false,
                id: id,
                participantId: '',
                userId: ''
            };
            record.participantId = filteredId.length > 0 ? filteredId[0].id : user.docId;
            record.userId = user.docId;
            createInbox(record).catch((e: any) => {
                console.error(e);
                resolve();
            });
        });
    });

    return Promise.all(users);
}

export async function getAllEHRReceipts() {
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
    let url = `${localStorage.getItem('apiUrl')}/ehr/get`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };
    const body = { path: path };
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

export async function getAllOrgs() {
    const firestore = getFirestore();
    return getDocs(collection(firestore, 'org'));
}

export async function addOrg(org: Org) {
    const firestore = getFirestore();
    return addDoc(collection(firestore, 'org'), org);
}

export async function updateOrg(docId: string, org: Org) {
    const firestore = getFirestore();
    const orgRef = doc(firestore, 'org', docId);
    return setDoc(orgRef, org, { merge: true });
}

export async function checkUserExists(emailAddress: string) {
    const fbFunctions = getFunctions();
    const checkUserExistsFunction = httpsCallable(fbFunctions, 'checkUserExists');
    return checkUserExistsFunction({ email: emailAddress });
}

export async function setAdmin(emailAddress: string, orgId: string) {
    const fbFunctions = getFunctions();
    const setAdminFunction = httpsCallable(fbFunctions, 'setAdmin');
    return setAdminFunction({ email: emailAddress, org: orgId });
}

export async function createAdminUser(org: Org) {
    const password = generate({
        length: 10,
        uppercase: true,
        lowercase: true,
        numbers: true
    });
    const secondaryApp = initializeApp(firebaseConfig, guid());
    const secondaryAuth = getAuth(secondaryApp);
    const createResult = await createUserWithEmailAndPassword(secondaryAuth, org.adminEmail, password);
    signOut(secondaryAuth);
    let retVal = null;
    if (createResult) {
        try {
            const firestore = getFirestore();
            const userRef = doc(firestore, 'users', createResult.user.uid);
            const userData = {
                id: org.id,
                name: org.name,
                contactName: org.contactName,
                orgAdmin: true,
                adminEmail: org.adminEmail,
                active: org.active,
                dateCreated: format(new Date(), dateFormats.MM_dd_yyyy),
                userName: org.adminEmail,
                org: org.id
            };
            await setDoc(userRef, userData);
            const auth = getAuth();
            await sendPasswordResetEmail(auth, org.adminEmail);
            retVal = true;
        } catch (e) {
            console.error(`Unable to create user ${org.adminEmail}`);
            retVal = false;
        }
    }
    return retVal;
}

export async function getDiaryJSONExport(surveyId: string) {
    const tken = await getCurrentUserToken();
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
    const tken = await getCurrentUserToken();
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

export async function getQuestionnaireResponseJSONExport(questionnaireId: string) {
    const tken = await getCurrentUserToken();
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

export async function getQuestionnaireResponseFHIRExport(questionnaireId: string) {
    const tken = await getCurrentUserToken();
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

const getCurrentUserToken = async () => {
    const auth = getAuth();
    return auth.currentUser.getIdToken(true);
};

/*export async function triggerCloudFunction(triggerType: string) {
    const tken = await getCurrentUserToken();
    let url = `${process.env.REACT_APP_BASE_URL}/triggerCloudFunction`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tken}`
    };

    const payload = {
        triggerType
    };
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });
}*/
