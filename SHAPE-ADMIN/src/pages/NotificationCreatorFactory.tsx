import React from 'react';
import { isEmptyObject, participantQuery, publicParticipantQuery } from '../utils/Utils';
import {
    getOpenQuestionnaires,
    sendEmailNotification,
    sendTextNotification,
    addNotificationToDatabase,
    sendToInbox
} from '../utils/API';
import { subYears, format, formatISO } from 'date-fns';
import { Survey, Questionnaire, User } from '../interfaces/DataTypes';
import { dateFormats } from '../utils/Constants';

export function setSurvey(context: React.Component, survey: Survey) {
    let questionnaireList: Array<Questionnaire> = [];
    if (typeof survey === 'object' && survey !== null) {
        getOpenQuestionnaires(survey.id)
            .then((snapshot: any) => {
                return new Promise<void>((resolve, reject) => {
                    snapshot.forEach((doc: any) => {
                        let questionnaire = doc.data;
                        questionnaire.id = doc.id;
                        questionnaireList.push(questionnaire);
                    });
                    resolve();
                });
            })
            .then(() => {
                context.setState({
                    questionnaires: questionnaireList
                });
            })
            .catch((err: any) => {
                console.error(err);
            });
        context.setState({ survey: survey });
    } else {
        context.setState({
            questionnaires: []
        });
    }
}

export function setQuestionnaire(context: React.Component, questionnaire: Questionnaire) {
    context.setState({ questionnaire: questionnaire });
}

export function setAge(context: React.Component, val: { lower: number; upper: number }) {
    context.setState({ age: val });
}

export function setGender(
    context: React.Component,
    val: string,
    gender: { gender: string; operator: string; isDate: boolean }
) {
    context.setState({ gender: { ...gender, gender: val, operator: 'equals' } });
}

export function setSubject(context: React.Component, subject: string) {
    context.setState({ subject: subject });
}

export function setMessage(context: React.Component, message: string) {
    context.setState({ message: message });
}

export function setSMSChecked(
    context: React.Component,
    participant: User,
    checked: boolean,
    checkedSMSList: Array<User>
) {
    if (checked) {
        checkedSMSList.push(participant);
        context.setState({ checkedSMSList: checkedSMSList });
    } else {
        checkedSMSList = checkedSMSList.filter((elem: User) => {
            return elem.docId !== participant.docId;
        });
        context.setState({ checkedSMSList: checkedSMSList });
    }
}

export function setInAppChecked(
    context: React.Component,
    participant: User,
    checked: boolean,
    checkedInAppList: Array<User>
) {
    if (checked) {
        checkedInAppList.push(participant);
        context.setState({ checkedInAppList: checkedInAppList });
    } else {
        checkedInAppList = checkedInAppList.filter((elem: User) => {
            return elem.docId !== participant.docId;
        });
        context.setState({ checkedInAppList: checkedInAppList });
    }
}

export function setEmailChecked(
    context: React.Component,
    participant: User,
    checked: boolean,
    checkedEmailList: Array<User>
) {
    if (checked) {
        checkedEmailList.push(participant);
        context.setState({ checkedEmailList: checkedEmailList });
    } else {
        checkedEmailList = checkedEmailList.filter((elem: User) => {
            return elem.docId !== participant.docId;
        });
        context.setState({ checkedEmailList: checkedEmailList });
    }
}

export function checkAllEmail(
    context: React.Component,
    participantList: Array<User>,
    allEmailChecked: boolean,
    checkedEmailList: Array<User>
) {
    let filteredParticipantList = participantList.filter((elem: User) => {
        return elem.emailEnabled;
    });

    // add new elements
    if (!allEmailChecked) {
        filteredParticipantList.forEach((elem: User) => {
            let filteredList = checkedEmailList.filter((e: User) => {
                return elem.docId === e.docId;
            });
            if (filteredList.length === 0) {
                checkedEmailList.push(elem);
            }
        });
        context.setState({
            checkedEmailList: checkedEmailList,
            allEmailChecked: true
        });
    } else {
        // remove elements currently displayed
        let filteredList = checkedEmailList.filter((e: User) => {
            return (
                filteredParticipantList.filter((elem: User) => {
                    return elem.docId === e.docId;
                }).length === 0
            );
        });

        context.setState({
            checkedEmailList: filteredList,
            allEmailChecked: false
        });
    }
}

export function checkAllInApp(
    context: React.Component,
    participantList: Array<User>,
    allInAppChecked: boolean,
    checkedInAppList: Array<User>
) {
    // add new elements
    if (!allInAppChecked) {
        participantList.forEach((elem: User) => {
            let filteredList = checkedInAppList.filter((e: User) => {
                return elem.docId === e.docId;
            });
            if (filteredList.length === 0) {
                checkedInAppList.push(elem);
            }
        });
        context.setState({
            checkedInAppList: checkedInAppList,
            allInAppChecked: true
        });
    } else {
        // remove elements currently displayed
        let filteredList = checkedInAppList.filter((e: User) => {
            return (
                participantList.filter((elem: User) => {
                    return elem.docId === e.docId;
                }).length === 0
            );
        });

        context.setState({
            checkedInAppList: filteredList,
            allInAppChecked: false
        });
    }
}

export function checkAllSMS(
    context: React.Component,
    participantList: Array<User>,
    allSMSChecked: boolean,
    checkedSMSList: Array<User>
) {
    let filteredParticipantList = participantList.filter((elem: User) => {
        return elem.smsEnabled;
    });

    // add new elements
    if (!allSMSChecked) {
        filteredParticipantList.forEach((elem: User) => {
            let filteredList = checkedSMSList.filter((e: User) => {
                return elem.docId === e.docId;
            });
            if (filteredList.length === 0) {
                checkedSMSList.push(elem);
            }
        });
        context.setState({
            checkedSMSList: checkedSMSList,
            allSMSChecked: true
        });
    } else {
        // remove elements currently displayed
        let filteredList = checkedSMSList.filter((e: User) => {
            return (
                filteredParticipantList.filter((elem: User) => {
                    return elem.docId === e.docId;
                }).length === 0
            );
        });

        context.setState({ checkedSMSList: filteredList, allSMSChecked: false });
    }
}

export function filterForRespondents(
    context: React.Component,
    survey: Survey,
    questionnaire: Questionnaire,
    age: { lower: number; upper: number },
    gender: { gender: string; operator: string; isDate: boolean }
) {
    context.setState({ isLoading: true });
    let list: any = [];
    if (!(age.lower === 0 && age.upper === 0)) {
        let upper = age.upper;
        let lower = age.lower;
        let upperAge = {
            dob: format(subYears(new Date(), upper), dateFormats.MMddyyyy),
            operator: 'greaterThanOrEqualTo',
            isDate: true
        };
        let lowerAge = {
            dob: format(subYears(new Date(), lower), dateFormats.MMddyyyy),
            operator: 'lessThanOrEqualTo',
            isDate: true
        };

        list.push(lowerAge);
        list.push(upperAge);
    }

    if (!isEmptyObject(gender.gender)) {
        list.push(gender);
    }

    let surveyId = !isEmptyObject(survey) ? survey.id : null;
    let questionnaireId = !isEmptyObject(questionnaire) ? questionnaire.id : null;

    // age would be converted to dob depending on current time and number provided
    participantQuery(surveyId, questionnaireId, list)
        .then((res: any) => {
            context.setState({
                participantList: res.sort((p1: any, p2: any) => (p1.firstName > p2.firstName ? 1 : -1)),
                isLoading: false
            });
        })
        .catch((err: any) => {
            console.error(err);
        });
}

export function filterForPublicRespondents(
    context: React.Component,
    survey: Survey,
    questionnaire: Questionnaire,
    age: { lower: number; upper: number },
    gender: { gender: string; operator: string; isDate: boolean },
    surveys: Array<Survey>
) {
    context.setState({ isLoading: true });
    let list: any = [];
    if (!(age.lower === 0 && age.upper === 0)) {
        let upper = age.upper;
        let lower = age.lower;
        let upperAge = {
            dob: format(subYears(new Date(), upper), dateFormats.MMddyyyy),
            operator: 'greaterThanOrEqualTo',
            isDate: true
        };
        let lowerAge = {
            dob: format(subYears(new Date(), lower), dateFormats.MMddyyyy),
            operator: 'lessThanOrEqualTo',
            isDate: true
        };

        list.push(lowerAge);
        list.push(upperAge);
    }

    if (!isEmptyObject(gender.gender)) {
        list.push(gender);
    }

    let surveyId = !isEmptyObject(survey) ? survey.id : null;
    let questionnaireId = !isEmptyObject(questionnaire) ? questionnaire.id : null;

    // age would be converted to dob depending on current time and number provided
    publicParticipantQuery(surveyId, questionnaireId, list, surveys)
        .then((res: any) => {
            context.setState({
                participantList: res.sort((p1: any, p2: any) => (p1.firstName > p2.firstName ? 1 : -1)),
                isLoading: false
            });
        })
        .catch((err: any) => {
            console.error(err);
        });
}

export function sendNotifications(
    context: React.Component,
    subject: string,
    message: string,
    checkedEmailList: Array<User>,
    checkedSMSList: Array<User>,
    checkedInAppList: Array<User>,
    org: string,
    publicAccess: boolean,
    publicSurveys: Array<Survey> = []
) {
    context.setState({ isLoading: true });
    let timestamp = formatISO(new Date());
    if (!isEmptyObject(message) && !isEmptyObject(subject)) {
        let pushRecipients: User[] = [];

        if (!isEmptyObject(checkedInAppList)) {
            pushRecipients = checkedInAppList.filter((participant: User) => {
                return participant.pushEnabled === true && !isEmptyObject(participant.token);
            });
        }

        let messageData = {
            subject: subject,
            message: message,
            timestamp: timestamp,
            emailRecipients: checkedEmailList,
            smsRecipients: checkedSMSList,
            inAppRecipients: checkedInAppList,
            pushRecipients: pushRecipients
        };

        addNotificationToDatabase(messageData, org, publicAccess)
            .then(() => {
                if (!isEmptyObject(checkedEmailList)) {
                    sendEmailNotification(messageData);
                }

                if (!isEmptyObject(checkedSMSList)) {
                    let phoneNums = checkedSMSList.map((e: any) => e.phoneNumber);
                    let formattedPhoneNums = phoneNums.map((number: string) => {
                        return '+1' + number.replace(/[^0-9]/g, '');
                    });

                    sendTextNotification(subject, message, formattedPhoneNums).catch((e) => {
                        console.error('Error in sending SMS notifications: ' + e);
                    });
                }

                if (!isEmptyObject(checkedInAppList)) {
                    let deviceTokens = checkedInAppList
                        .filter((participant: User) => {
                            return participant.pushEnabled === true && !isEmptyObject(participant.token);
                        })
                        .map((e: User) => e.token);

                    sendToInbox(subject, message, timestamp, checkedInAppList, deviceTokens, org).catch(
                        (e: any) => {
                            console.error('Error in adding to inbox: ' + e);
                        }
                    );
                }

                if (publicAccess) {
                    publicParticipantQuery('', '', [], publicSurveys)
                        .then((res: any) => {
                            context.setState({
                                survey: null,
                                questionnaire: null,
                                text: '',
                                result: '',
                                message: '',
                                subject: '',
                                participantList: res.sort((p1: any, p2: any) =>
                                    p1.firstName > p2.firstName ? 1 : -1
                                ),
                                checkedEmailList: [],
                                checkedSMSList: [],
                                checkedInAppList: [],
                                questionnaires: [],
                                age: { lower: 0, upper: 0 },
                                gender: {
                                    gender: '',
                                    operator: 'equals',
                                    isDate: false
                                },
                                allEmailChecked: false,
                                allSMSChecked: false,
                                allInAppChecked: false,
                                failure: false,
                                showToast: true,
                                isLoading: false
                            });
                        })
                        .catch((error: any) => {
                            console.error(error);
                        });
                } else {
                    participantQuery('', '', [])
                        .then((res: any) => {
                            context.setState({
                                survey: null,
                                questionnaire: null,
                                text: '',
                                result: '',
                                message: '',
                                subject: '',
                                participantList: res.sort((p1: any, p2: any) =>
                                    p1.firstName > p2.firstName ? 1 : -1
                                ),
                                checkedEmailList: [],
                                checkedSMSList: [],
                                checkedInAppList: [],
                                questionnaires: [],
                                age: { lower: 0, upper: 0 },
                                gender: {
                                    gender: '',
                                    operator: 'equals',
                                    isDate: false
                                },
                                allEmailChecked: false,
                                allSMSChecked: false,
                                allInAppChecked: false,
                                failure: false,
                                showToast: true,
                                isLoading: false
                            });
                        })
                        .catch((error: any) => {
                            console.error(error);
                        });
                }
            })
            .catch((error: any) => {
                console.error(error);
            });
    } else {
        context.setState({ failure: true });
    }
}

export function clearFilters(context: React.Component) {
    context.setState({
        isLoading: true,
        survey: null,
        questionnaire: null,
        questionnaires: [],
        age: { lower: 0, upper: 0 },
        gender: { gender: '', operator: 'equals', isDate: false }
    });
    participantQuery('', '', [])
        .then((res: any) => {
            context.setState({
                participantList: res.sort((p1: any, p2: any) => (p1.firstName > p2.firstName ? 1 : -1)),
                isLoading: false
            });
        })
        .catch((error: any) => {
            console.error(error);
        });
}

export function publicClearFilters(context: React.Component, surveys: Array<Survey>) {
    context.setState({
        isLoading: true,
        survey: null,
        questionnaire: null,
        questionnaires: [],
        age: { lower: 0, upper: 0 },
        gender: { gender: '', operator: 'equals', isDate: false }
    });
    publicParticipantQuery('', '', [], surveys)
        .then((res: any) => {
            context.setState({
                participantList: res.sort((p1: any, p2: any) => (p1.firstName > p2.firstName ? 1 : -1)),
                isLoading: false
            });
        })
        .catch((error: any) => {
            console.error(error);
        });
}
