import {ParticipantDiary} from "../interfaces";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";

admin.initializeApp(functions.config().firebase, 'participant-diary');


export class ParticipantDiaryService {
    db = admin.firestore();
    collection = "participant-diary";

    private processParticipantDiary(participantQuerySnapshot:any, callback: CallbackFunction) {
        const participantDiaries: ResponseData[] = [];
        participantQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
            participantDiaries.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        callback(false, participantDiaries);
    }

    create(participantDiary: ParticipantDiary, callback: CallbackFunction) {
        this.db.collection(this.collection)
            .add(participantDiary).then((newDoc: any) => {
                callback(false, {id: newDoc.id});
        }).catch((error) => {
            console.error(error);
            callback(true, error);
        })
    }

    query(org:string, participantId: any, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection)
                .where("participantId", "==", participantId)
                .get()
                .then((participantQuerySnapshot) => {
                    this.processParticipantDiary(participantQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .where("participantId", "==", participantId)
                .get()
                .then((participantQuerySnapshot) => {
                        this.processParticipantDiary(participantQuerySnapshot, callback);
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
                .then((participantDiarySnapshot: any) => {
                    this.processParticipantDiary(participantDiarySnapshot, callback);
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
                .then((participantDiarySnapshot: any) => {
                    this.processParticipantDiary(participantDiarySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }

    getAll(org:string, callback: CallbackFunction) {
        if(org ===  "ALL")  {
            this.db.collection(this.collection)
                .get()
                .then((participantQuerySnapshot: any) => {
                    this.processParticipantDiary(participantQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .get()
                .then((participantQuerySnapshot: any) => {
                    this.processParticipantDiary(participantQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }

    filter(org:string, query: { participantDiaryId: string }, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection).doc(query.participantDiaryId).get().then((participantDiary) => {
                if (!participantDiary.exists) {
                    callback(true, {id: query.participantDiaryId, data: "Not Found", returned: participantDiary});
                } else {
                    callback(false, {id: participantDiary.id, data: participantDiary.data()})
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(query.participantDiaryId).get().then((participantDiary) => {
                if (!participantDiary.exists) {
                    callback(true, {id: query.participantDiaryId, data: "Not Found", returned: participantDiary});
                } else {
                    const data = participantDiary.data();
                    if(data!.org === org) {
                        callback(false, {id: participantDiary.id, data: participantDiary.data()})
                    } else {
                        callback(true, {id: query.participantDiaryId, data: "Not Permitted", returned: {}});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }

    update(org:string, data: any, callback: CallbackFunction) {
        if(org === "ALL") {
            // @ts-ignore
            this.db.collection(this.collection).doc(data.id).set(data.participantDiary, {merge: true})
                .then(() => {
                    callback(false, data.participantDiary);
                })
                .catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection).doc(data.id).get().then((participantDiary) => {
                if (!participantDiary.exists) {
                    callback(true, {id: data.id, data: "Not Found", returned: participantDiary});
                } else {
                    const diary = participantDiary.data();
                    if(diary!.org === org) {
                        // @ts-ignore
                        this.db.collection(this.collection).doc(data.id).set(data.participantDiary, {merge: true})
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

    delete(org:string, id: string, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection).doc(id).delete().then(() => {
                callback(false, {id: id, data: "was deleted", deletedCount: 1});
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(id).get().then((participantDiary) => {
                if (!participantDiary.exists) {
                    callback(true, {id: id, data: "Not Found", deletedCount: 0});
                } else {
                    const diary = participantDiary.data();
                    if(diary!.org === org) {
                        this.db.collection(this.collection).doc(id).delete().then(() => {
                            callback(false, {id: id, data: "was deleted", deletedCount: 1});
                        }).catch((error) => {
                            console.error(error)
                            callback(true, error);
                        })
                    } else {
                        callback(true, {id: id, data: "Not Permitted", deletedCount: 0});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }
}
