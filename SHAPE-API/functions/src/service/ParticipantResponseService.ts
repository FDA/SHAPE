import {ParticipantResponse} from "../interfaces";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";

admin.initializeApp(functions.config().firebase, 'participant-response');


export class ParticipantResponseService {
    db = admin.firestore();
    collection = "participant-response";

    private processParticipant(participantQuerySnapshot: any, callback: CallbackFunction) {
        const participantResponses: ResponseData[] = [];
        participantQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
            participantResponses.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        callback(false, participantResponses);
    }

    create(participantResponse: ParticipantResponse, callback: CallbackFunction) {
        this.db.collection(this.collection)
            .add(participantResponse).then((newDoc: any) => {
                callback(false, {id: newDoc.id});
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }

    public getAll(org:string, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection).get().then((participantQuerySnapshot: any) => {
                this.processParticipant(participantQuerySnapshot, callback);
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else { 
            this.db.collection(this.collection).where("org", "==", org).get().then((participantQuerySnapshot: any) => {
                this.processParticipant(participantQuerySnapshot, callback);
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }

    public filter(org:string, query: any, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection).doc(query.participantResponseId).get().then((participantResponse) => {
                if (!participantResponse.exists) {
                    callback(true, {id: query.participantResponseId, data: "Not Found", returned: participantResponse});
                } else {
                    callback(false, {id: participantResponse.id, data: participantResponse.data()})
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(query.participantResponseId).get().then((participantResponse) => {
                if (!participantResponse.exists) {
                    callback(true, {id: query.participantResponseId, data: "Not Found", returned: participantResponse});
                } else {
                    let data = participantResponse.data();
                    if(data!.org === org) {
                        callback(false, {id: participantResponse.id, data: participantResponse.data()})
                    } else {
                        callback(true, {id: query.participantResponseId, data: "Not Permitted", returned: {}});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }

    }

    query(org: string, participantId: any, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection)
                .where("participantId", "==", participantId)
                .get()
                .then((participantQuerySnapshot) => {
                    this.processParticipant(participantQuerySnapshot, callback);
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
                    this.processParticipant(participantQuerySnapshot, callback);
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

            for (const q of query) {
                request = request.where(q.key, q.operator, q.value);
            }
            request
                .get()
                .then((participantResponseSnapshot: any) => {
                    this.processParticipant(participantResponseSnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            let request = this.firestoreCollection(this.collection);

            for (const q of query) {
                request = request.where(q.key, q.operator, q.value);
            }
            request
                .where("org", "==", org)
                .get()
                .then((participantResponseSnapshot: any) => {
                    this.processParticipant(participantResponseSnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }

    update(org:string, data: any, callback: CallbackFunction) {
        if (org === "ALL") {
            this.db.collection(this.collection).doc(data.id).get().then((participantResponse) => {
                if (!participantResponse.exists) {
                    callback(true, {id: data.id, data: "Not Found", returned: participantResponse});
                } else {
                    this.db.collection(this.collection).doc(data.id).set(data.participantResponse, {merge: true})
                        .then(() => {
                            callback(false, data.participantResponse);
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
            this.db.collection(this.collection).doc(data.id).get().then((participantResponse) => {
                if (!participantResponse.exists) {
                    callback(true, {id: data.id, data: "Not Found", returned: participantResponse});
                } else {
                    const response = participantResponse.data();
                    if(response!.org === org) {
                        // @ts-ignore
                        this.db.collection(this.collection).doc(data.id).set(data.participantResponse, {merge: true})
                            .then(() => {
                                callback(false, data.participantResponse);
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
        if (org === "ALL") {
            this.db.collection(this.collection).doc(id).get().then((participantResponse) => {
                if (!participantResponse.exists) {
                    callback(true, {id: id, data: "Not Found", deletedCount: 0, returned: participantResponse});
                } else {
                    this.db.collection(this.collection).doc(id).delete().then(() => {
                        callback(false, {id: id, data: "was deleted", deletedCount: 1})
                    }).catch((error) => {
                        console.error(error)
                        callback(true, error);
                    })
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(id).get().then((participantResponse) => {
                if (!participantResponse.exists) {
                    callback(true, {id: id, data: "Not Found", deletedCount: 0, returned: participantResponse});
                } else {
                    const response = participantResponse.data();
                    if(response!.org === org) {
                        this.db.collection(this.collection).doc(id).delete().then(() => {
                            callback(false, {id: id, data: "was deleted", deletedCount: 1})
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
