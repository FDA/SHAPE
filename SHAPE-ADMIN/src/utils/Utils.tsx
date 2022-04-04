import {
    getUserInfo,
    getQuestionnaire,
    getActiveUser,
    getSurvey,
    getActiveUsers
} from './API';
import {compareAsc} from 'date-fns';
import {transform, isEqual, isObject} from 'lodash';
import {User} from '../interfaces/DataTypes';
import {v4 as uuidv4} from 'uuid';

require('firebase/firestore');

export const isEmptyObject = (obj: any) => {
    if (
        obj === undefined ||
        obj === null ||
        obj === '' ||
        obj.length === 0 ||
        obj === 'NaN'
    ) {
        return true;
    }
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const guid = () => {
    return uuidv4();
};

export function difference(object: any, base: any) {
    function changes(obj: any, b: any) {
        return transform(obj, function (result, value, key) {
            if (!isEqual(value, b[key])) {
                // @ts-ignore
                // prettier-ignore
                result[key] = (isObject(value) && isObject(b[key])) ? changes(value, b[key]) : value;
            }
        });
    }
    return changes(object, base);
}

// Purpose: query back a set of participants that fit a certain criteria
// surveyId is the document ID of the survey -- should be a "" or null if not searched for
// questionnaireId is the document ID of the questionnaire -- should be a "" or null if not searched fo
// list can be any property of a profile as long as it contains these three properties:
// property name and value (ex. {gender: "F"})
// operator (ex. {operator: "equals"}) which can be "equals", "greaterThan", "greaterThanOrEqualTo", "lessThan", "lessThanOrEqualTo"
// isDate and boolean (ex. {isDate: false})
// only "active" participants are every queried back in the set

function filterProfiles(
    participants: Array<User>,
    list: any,
    operator: string,
    key: string,
    item: string,
    isDate: boolean
) {
    return participants.filter((participant: User) => {
        participant.profiles = participant.profiles.filter((profile: any) => {
            switch (operator) {
                case 'equals':
                    return profile[key] === list[item][key];
                case 'greaterThan':
                    if (isDate)
                        return (
                            compareAsc(
                                new Date(profile[key]),
                                new Date(list[item][key])
                            ) > 0
                        );
                    return profile[key] > list[item][key];
                case 'greaterThanOrEqualTo':
                    if (isDate)
                        return (
                            compareAsc(
                                new Date(profile[key]),
                                new Date(list[item][key])
                            ) >= 0
                        );
                    return profile[key] >= list[item][key];
                case 'lessThan':
                    if (isDate)
                        return (
                            compareAsc(
                                new Date(profile[key]),
                                new Date(list[item][key])
                            ) < 0
                        );
                    return profile[key] < list[item][key];
                case 'lessThanOrEqualTo':
                    if (isDate)
                        return (
                            compareAsc(
                                new Date(profile[key]),
                                new Date(list[item][key])
                            ) <= 0
                        );
                    return profile[key] <= list[item][key];
                default:
                    return false;
            }
        });
        return participant.profiles.length > 0;
    });
}

function query(participants: Array<User>, list: any) {
    for (let item in list) {
        let object = list[item];
        let key = Object.keys(object)[0];
        let operator = object.operator;
        let isDate = object.isDate;
        //this strips out profiles that do not match from the object
        participants = filterProfiles(
            participants,
            list,
            operator,
            key,
            item,
            isDate
        );
    }

    let finalParticipantArr: Array<User> = [];

    let promises = participants.map((participant: any) => {
        return new Promise((resolve, reject) => {
            getUserInfo(participant.docId)
                .then((data: any) => {
                    if (!isEmptyObject(data.data)) {
                        participant.email = data.data.phoneNumber;
                    } else {
                        participant.email = '';
                    }
                    finalParticipantArr.push(participant);
                    resolve();
                })
                .catch((err: any) => {
                    console.error(err);
                });
        });
    });

    return Promise.all(promises).then((res) => {
        return finalParticipantArr;
    });
}

function questionnaireFunction(questionnaireId: string, list: any) {
    return getQuestionnaire(questionnaireId)
        .then((doc: any) => {
            return new Promise((resolve, reject) => {
                let data = doc.data;
                let allUsers: any = [];
                if (!isEmptyObject(data.participants)) {
                    let promises = [];
                    for (let participant in data.participants) {
                        promises.push(
                            new Promise((res, rej) => {
                                getActiveUser(data.participants[participant])
                                    .then(function (snapshot: any) {
                                        snapshot.forEach(function (snap: any) {
                                            let dat = snap.data;
                                            data.docId = snap.id;
                                            allUsers.push(dat);
                                        });
                                        res();
                                    })
                                    .catch((err: any) => {
                                        console.error(err);
                                    });
                            })
                        );
                    }

                    Promise.all(promises)
                        .then((res) => {
                            query(allUsers, list).then((result) => {
                                resolve(result);
                            });
                        })
                        .catch((err: any) => {
                            console.error(err);
                        });
                } else {
                    resolve([]);
                }
            });
        })
        .catch((err: any) => {
            console.error(err);
        });
}

export function surveyFunction(surveyId: string, list: any) {
    return getSurvey(surveyId).then((doc: any) => {
        return new Promise((resolve, reject) => {
            let data = doc.data;
            let allUsers: any = [];
            if (!isEmptyObject(data.participants)) {
                let promises = [];
                for (let participant in data.participants) {
                    promises.push(
                        new Promise((res, rej) => {
                            getActiveUser(data.participants[participant]).then(
                                function (snapshot: any) {
                                    snapshot.forEach(function (snap: any) {
                                        let dat = snap.data;
                                        data.docId = snap.id;
                                        allUsers.push(dat);
                                    });
                                    res();
                                }
                            );
                        })
                    );
                }

                Promise.all(promises)
                    .then(() => {
                        query(allUsers, list).then((result) => {
                            resolve(result);
                        });
                    })
                    .catch((err: any) => {
                        console.error(err);
                    });
            } else {
                resolve([]);
            }
        });
    });
}

export function activeUserFunction(list: any) {
    return getActiveUsers()
        .then(function (snapshot: any) {
            return new Promise((resolve, reject) => {
                let allUsers: any = [];
                snapshot.forEach(function (doc: any) {
                    let data = doc.data;
                    data.docId = doc.id;
                    if (data.orgAdmin) {
                        // do nothing
                    } else {
                        allUsers.push(data);
                    }
                });
                query(allUsers, list)
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((err: any) => {
                        console.error(err);
                    });
            });
        })
        .catch((err: any) => {
            console.error(err);
        });
}

export function participantQuery(
    surveyId: string,
    questionnaireId: string,
    list: any
) {
    if (!isEmptyObject(questionnaireId)) {
        return questionnaireFunction(questionnaireId, list);
    } else if (!isEmptyObject(surveyId)) {
        return surveyFunction(surveyId, list);
    } else {
        return activeUserFunction(list);
    }
}
