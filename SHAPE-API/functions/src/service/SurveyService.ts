import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";
import {Survey} from "../interfaces";

admin.initializeApp(functions.config().firebase, 'survey');

export class SurveyService {
    db = admin.firestore();
    collection = "survey";

    private processSurvey(surveyQuerySnapshot: any, callback: CallbackFunction) {
        const surveys: ResponseData[] = [];
        surveyQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
            surveys.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        callback(false, surveys);
    }

    public create(survey: Survey, callback: CallbackFunction) {
        this.db.collection(this.collection).add(survey).then((newDoc: any) => {
            callback(false, {id: newDoc.id});
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }

    public getAll(orgId: string, callback: CallbackFunction) {
        if (orgId === 'ALL') {
            this.db.collection(this.collection).get().then((surveyQuerySnapshot: any) => {
                this.processSurvey(surveyQuerySnapshot, callback);
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).where("org", "==", orgId).get().then((surveyQuerySnapshot: any) => {
                this.processSurvey(surveyQuerySnapshot, callback);
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }

    firestoreCollection(collectionName: string): FirebaseFirestore.Query<FirebaseFirestore.DocumentData> {
        return this.db.collection(collectionName);
    }

    public complexQuery(query: any, org: string, callback: CallbackFunction) {
        let request = this.firestoreCollection(this.collection);

        for (let q of query) {
            request = request.where(q.key, q.operator, q.value);
        }
        if (org !== "ALL") {
            request = request.where("org", "==", org)
        }
        request.get().then((surveySnapshot: any) => {
            this.processSurvey(surveySnapshot, callback);
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }

    public query(participantId: any, org: string, callback: CallbackFunction) {
        if (org === "ALL") {
            this.db.collection(this.collection)
                .where("participants", "array-contains", participantId)
                .get()
                .then((surveySnapshot) => {
                    this.processSurvey(surveySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .where("participantId", "==", participantId)
                .get()
                .then((surveyQuerySnapshot) => {
                    this.processSurvey(surveyQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }

    public filter(query: any, org: string, callback: CallbackFunction) {
        if (org === "ALL") {
            this.db.collection(this.collection).doc(query.surveyId).get().then((survey) => {
                if (!survey.exists) {
                    callback(true, {id: query.surveyId, data: "Not Found", returned: survey});
                } else {
                    callback(false, {id: survey.id, data: survey.data()})
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(query.surveyId).get().then((survey) => {
                if (!survey.exists) {
                    callback(true, {id: query.surveyId, data: "Not Found", returned: survey});
                } else {
                    const data = survey.data();
                    if (data!.org === org) {
                        callback(false, {id: survey.id, data: data})
                    } else {
                        callback(true, {id: query.surveyId, data: "Not Permitted", returned: {}});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })

        }
    }

    public delete(surveyId: string, org: string, callback: CallbackFunction) {
        if (org === "ALL") {
            this.db.collection(this.collection).doc(surveyId).delete().then(() => {
                callback(false, {id: surveyId, data: "was deleted"})
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(surveyId).get().then((survey) => {
                if (!survey.exists) {
                    callback(true, {deletedCount: 1});
                } else {
                    const data = survey.data();
                    if (data!.org === org) {
                        this.db.collection(this.collection).doc(surveyId).delete().then(() => {
                            callback(false, {deletedCount: 1});
                        }).catch((error) => {
                            console.error(error)
                            callback(true, error);
                        })
                    } else {
                        callback(true, {deletedCount: 0});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }


    public update(data: any, org: string, callback: CallbackFunction) {
        if (org === "ALL") {
            this.db.collection(this.collection).doc(data.id).set(data.survey, {merge: true})
                .then(() => {
                    callback(false, {id: data.id, data: "updated"});
                })
                .catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection).doc(data.id).get().then((survey) => {
                if (!survey.exists) {
                    callback(true, {id: data.id, data: "Not Found", returned: survey});
                } else {
                    const surveyData = survey.data();
                    if (surveyData!.org === org) {
                        // @ts-ignore
                        this.db.collection(this.collection).doc(data.id).set(data.survey, {merge: true})
                            .then(() => {
                                callback(false, data.id);
                            })
                            .catch((error) => {
                                console.error(error)
                                callback(true, error);
                            })
                    } else {
                        callback(true, {id: data.id, data: "Not Permitted", returned: {}});
                    }
                }

            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }

}

