import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";
import {Question} from "../interfaces";


admin.initializeApp(functions.config().firebase, 'question');

export class QuestionService {
    db = admin.firestore();
    collection = "question";

    private processQuestion(questionQuerySnapshot: any, callback: CallbackFunction) {
        const questions: ResponseData[] = [];
        questionQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
            questions.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        callback(false, questions);
    }

    public create(question: Question, callback: CallbackFunction) {
        this.db.collection(this.collection).add(question).then((newDoc: any) => {
            callback(false, {id: newDoc.id});
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }

    public getAll(org: string, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection).get().then((questionQuerySnapshot: any) => {
                this.processQuestion(questionQuerySnapshot, callback);
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).where("org", "==", org).get().then((questionQuerySnapshot: any) => {
                this.processQuestion(questionQuerySnapshot, callback);
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }

    }

    public filter(org: string, query: any, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection).doc(query.questionId).get().then((question) => {
                if (!question.exists) {
                    callback(true, {id: query.questionId, data: "Not Found", returned: question});
                } else {
                    callback(false, {id: question.id, data: question.data()})
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(query.questionId).get().then((question) => {
                if (!question.exists) {
                    callback(true, {id: query.questionId, data: "Not Found", returned: question});
                } else {
                    let q = question.data();
                    if(q!.org === org) {
                        callback(false, {id: question.id, data: question.data()})
                    } else {
                        callback(true, {id: query.questionId, data: "Not Permitted", returned: {}});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }

    }

    public delete(org: string, questionId: string, callback: CallbackFunction) {
        this.db.collection(this.collection).doc(questionId).get().then((question) => {
            if (!question.exists) {
                callback(true, {id: questionId, data: "Not Found", returned: question});
            } else {
                const q = question.data();
                if(q!.org === org) {
                    this.db.collection(this.collection).doc(questionId).delete().then(() => {
                        callback(false, {id: questionId, data: "was deleted"})
                    }).catch((error) => {
                        console.error(error)
                        callback(true, error);
                    })
                } else {
                    callback(true, {id: questionId, data: "Not Permitted", returned: {}});
                }
            }
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }


    public update(org: string, data: any, callback: CallbackFunction) {
        if (org === "ALL") {
            this.db.collection(this.collection).doc(data.id).get().then((question) => {
                if (!question.exists) {
                    callback(true, {id: data.id, data: "Not Found", returned: question});
                } else {
                    this.db.collection(this.collection).doc(data.id).set(data.question, {merge: true})
                    .then(() => {
                        callback(false, {id: data.id, data: "updated"});
                    })
                    .catch((error) => {
                        console.error(error)
                        callback(true, error);
                    })
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(data.id).get().then((question) => {
                if (!question.exists) {
                    callback(true, {id: data.id, data: "Not Found", returned: question});
                } else {
                    const q = question.data();
                    if(q!.org === org) {
                        this.db.collection(this.collection).doc(data.id).set(data.question, {merge: true})
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
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }


}

