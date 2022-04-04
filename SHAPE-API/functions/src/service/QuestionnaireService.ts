import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";
import { Questionnaire,  } from "../interfaces";


admin.initializeApp(functions.config().firebase, 'questionnaire');

export class QuestionnaireService {
    db = admin.firestore();
    collection = "questionnaire";

    private processQuestionnaires(questionnaireQuerySnapshot: any, callback: CallbackFunction) {
        const questionnaires: ResponseData[] = [];
        questionnaireQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
            questionnaires.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        callback(false, questionnaires);
    }

    public create(questionnaire: Questionnaire, callback: CallbackFunction) {
        this.db.collection(this.collection).add(questionnaire).then((newDoc: any) => {
            callback(false, {id: newDoc.id});
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }

    public getAll(org: string, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection)
                .get()
                .then((questionnaireQuerySnapshot: any) => {
                    this.processQuestionnaires(questionnaireQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .get()
                .then((questionnaireQuerySnapshot: any) => {
                    this.processQuestionnaires(questionnaireQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }

    firestoreCollection(collectionName: string): FirebaseFirestore.Query<FirebaseFirestore.DocumentData> {
        return this.db.collection(collectionName);
    }

    public complexQuery(org:string, query: any, callback: CallbackFunction) {
        if(org === "ALL") {
            let request = this.firestoreCollection(this.collection);

            for (let q of query) {
                request = request.where(q.key, q.operator, q.value);
            }
            request
                .get()
                .then((questionnaireSnapshot: any) => {
                    this.processQuestionnaires(questionnaireSnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            let request = this.firestoreCollection(this.collection);

            for (let q of query) {
                request = request.where(q.key, q.operator, q.value);
            }
            request
                .where("org", "==", org)
                .get()
                .then((questionnaireSnapshot: any) => {
                    this.processQuestionnaires(questionnaireSnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }

    public query(org:string, participantId: any, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection)
                .where("participants", "array-contains", participantId)
                .get()
                .then((questionnaireSnapshot) => {
                    this.processQuestionnaires(questionnaireSnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
            .where("org", "==", org)
            .where("participants", "array-contains", participantId)
            .get()
            .then((questionnaireSnapshot) => {
                this.processQuestionnaires(questionnaireSnapshot, callback);
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }

    }

    public filter(org:string, query: any, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection).doc(query.questionnaireId).get().then((questionnaire) => {
                if (!questionnaire.exists) {
                    callback(true, {id: query.questionnaireId, data: "Not Found", returned: questionnaire});
                } else {
                    callback(false, {id: questionnaire.id, data: questionnaire.data()})
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(query.questionnaireId).get().then((questionnaire) => {
                if (!questionnaire.exists) {
                    callback(true, {id: query.questionnaireId, data: "Not Found", returned: questionnaire});
                } else {
                    const q = questionnaire.data();
                    if(q!.org === org) {
                        callback(false, {id: questionnaire.id, data: questionnaire.data()})
                    } else {
                        callback(true, {id: query.questionnaireId, data: "Not Permitted", returned: {}});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }

    }

    public delete(org:string, questionnaireId: string, callback: CallbackFunction) {
        this.db.collection(this.collection).doc(questionnaireId).get().then((questionnaire) => {
            if (!questionnaire.exists) {
                callback(true, {id: questionnaireId, deletedCount: 0, data: "Not Found", returned: questionnaire});
            } else {
                const q = questionnaire.data();
                if(q!.org === org) {
                    this.db.collection(this.collection).doc(questionnaireId).delete().then(() => {
                        callback(false, {id: questionnaireId, deletedCount: 1, data: "was deleted"})
                    }).catch((error) => {
                        console.error(error)
                        callback(true, error);
                    })
                } else {
                    callback(true, {id: questionnaireId, deletedCount: 0, data: "Not Permitted", returned: {}});
                }
            }
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }


    public update(org:string, data: any, callback: CallbackFunction) {
        this.db.collection(this.collection).doc(data.id).get().then((questionnaire) => {
            if(org === "ALL") {
                if (!questionnaire.exists) {
                    callback(true, {id: data.id, data: "Not Found", returned: questionnaire});
                } else {
                    this.db.collection(this.collection).doc(data.id).set(data.questionnaire, {merge: true})
                    .then(() => {
                        callback(false, {id: data.id, data: "updated"});
                    })
                    .catch((error) => {
                        console.error(error)
                        callback(true, error);
                    })
                }
            } else {
                if (!questionnaire.exists) {
                    callback(true, {id: data.id, data: "Not Found", returned: questionnaire});
                } else {
                    const q = questionnaire.data();
                    if(q!.org === org) {
                        this.db.collection(this.collection).doc(data.id).set(data.questionnaire, {merge: true})
                        .then(() => {
                            callback(false, {id: data.id, data: "updated"});
                        })
                        .catch((error) => {
                            console.error(error)
                            callback(true, error);
                        })
                    } else {
                        callback(true, {id: data.id, data: "Not Permitted", returned: {}});
                    }
                }
            }
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }


}

