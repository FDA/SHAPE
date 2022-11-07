import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";
import {Participant} from "../interfaces";

initializeApp(functions.config().firebase, 'participant');
export class ParticipantService {
    db = getFirestore();
    collection = "participant";

    private processParticipant(participantQuerySnapshot: any, callback: CallbackFunction) {
        const participants: ResponseData[] = [];
        participantQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
            participants.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        callback(false, participants);
    }

    private processSingleParticipant(participantSnapshot: any, callback: CallbackFunction) {
        participantSnapshot.forEach((doc: { id: string; data: () => any }) => {
            callback(false, {
                id: doc.id,
                data: doc.data(),
            });
        });
    }

    public create(participant: Participant, callback: CallbackFunction) {
        participant.public = true;
        this.db.collection(this.collection)
            .add(participant).then((newDoc: any) => {
                callback(false, {id: newDoc.id});
            }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }

    public getAll(org:string, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection)
                .get()
                .then((participantQuerySnapshot: any) => {
                    this.processParticipant(participantQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })  
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .get()
                .then((participantQuerySnapshot: any) => {
                    this.processParticipant(participantQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })  
        }

    }

    public query(participantId: any, org: string, callback: CallbackFunction) {
        if (org === "ALL") {
            this.db.collection(this.collection)
                .where("participantId", "==", participantId)
                .get()
                .then((participantSnapshot) => {
                    this.processSingleParticipant(participantSnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .where("participantId", "==", participantId)
                .get()
                .then((participantSnapshot) => {
                    this.processSingleParticipant(participantSnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }

    public filter(org:string, query: any, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection).doc(query.participantId).get().then((participant) => {
                if (!participant.exists) {
                    callback(true, {id: query.participantId, data: "Not Found", returned: participant});
                } else {
                    callback(false, {id: participant.id, data: participant.data()})
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(query.participantId).get().then((participant) => {
                if (!participant.exists) {
                    callback(true, {id: query.participantId, data: "Not Found", returned: participant});
                } else {
                    const data = participant.data();
                    if(data!.org === org) {
                        callback(false, {id: participant.id, data: participant.data()})
                    } else {
                        callback(true, {id: query.participantId, data: "Not Permitted", returned: {}});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }

    public update(org:string, data: any, callback: CallbackFunction) {
        if (org === "ALL") {
            this.db.collection(this.collection).doc(data.docId).get().then((participant) => {
                if (!participant.exists) {
                    callback(true, {id: data.docId, data: "Not Found", returned: participant});
                } else {
                    this.db.collection(this.collection).doc(data.docId).set(data.participant, {merge: true})
                        .then(() => {
                            callback(false, {id: data.docId, data: "updated"});
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
            this.db.collection(this.collection).doc(data.docId).get().then((participant) => {
                if (!participant.exists) {
                    callback(true, {id: data.docId, data: "Not Found", returned: participant});
                } else {
                    const p = participant.data();
                    if(p!.org === org) {
                        this.db.collection(this.collection).doc(data.docId).set(data.participant, {merge: true})
                            .then(() => {
                                callback(false, {id: data.docId, data: "updated"});
                            })
                            .catch((error) => {
                                console.error(error)
                                callback(true, error);
                            })
                    } else {
                        callback(true, {id: data.docId, data: "Not Permitted", returned: {}});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }

    }

    public delete(org:string, docId: string, callback: CallbackFunction) {
        if (org === "ALL") {
            this.db.collection(this.collection).doc(docId).get().then((participant) => {
                if (!participant.exists) {
                    callback(true, {id: docId, data: "Not Found", deletedCount: 0, returned: participant});
                } else {
                    this.db.collection(this.collection).doc(docId).delete().then(() => {
                        callback(false, {id: docId, data: "was deleted", deletedCount: 1})
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
            this.db.collection(this.collection).doc(docId).get().then((participant) => {
                if (!participant.exists) {
                    callback(true, {id: docId, data: "Not Found", deletedCount: 0, returned: participant});
                } else {
                    const data = participant.data();
                    if(data!.org === org) {
                        this.db.collection(this.collection).doc(docId).delete().then(() => {
                            callback(false, {id: docId, data: "was deleted", deletedCount: 1})
                        }).catch((error) => {
                            console.error(error)
                            callback(true, error);
                        })
                    } else {
                        callback(true, {id: docId, data: "Not Permitted", deletedCount: 0, returned: {}});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }
}
