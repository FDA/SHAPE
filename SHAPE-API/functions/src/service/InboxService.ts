import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";
import {Inbox} from "../interfaces";


initializeApp(functions.config().firebase, 'inbox');

export class InboxService {
    db = getFirestore();
    collection = "inbox";

    private processInbox(inboxQuerySnapshot: any, callback: CallbackFunction) {
        const inboxes: ResponseData[] = [];
        inboxQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
            inboxes.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        callback(false, inboxes);
    }

    public create(inbox: Inbox, callback: CallbackFunction) {
        this.db.collection(this.collection).add(inbox).then((newDoc: any) => {
            callback(false, {id: newDoc.id});
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }

    public getAll(org:string, callback: CallbackFunction) {
        if (org === 'ALL') {
            this.db.collection(this.collection)
                .get()
                .then((inboxQuerySnapshot: any) => {
                    this.processInbox(inboxQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .get()
                .then((inboxQuerySnapshot: any) => {
                    this.processInbox(inboxQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }

    public filter(org:string, query: any, callback: CallbackFunction) {
        if (org === 'ALL') {
            this.db.collection(this.collection).doc(query.inboxId).get().then((inbox) => {
                if (!inbox.exists) {
                    callback(true, {id: query.inboxId, data: "Not Found", returned: inbox});
                } else {
                    callback(false, {id: inbox.id, data: inbox.data()})
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(query.inboxId).get().then((inbox) => {
                if (!inbox.exists) {
                    callback(true, {id: query.inboxId, data: "Not Found", returned: inbox});
                } else {
                    const data = inbox.data();
                    if (data!.org === org) {
                        callback(false, {id: inbox.id, data: inbox.data()})
                    } else {
                        callback(true, {id: query.inboxId, data: "Not Permitted", returned: {}});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }

    public delete(org:string, inboxId: string, callback: CallbackFunction) {
        if (org === 'ALL') {
            this.db.collection(this.collection).doc(inboxId).delete().then(() => {
                callback(false, {id: inboxId, data: "was deleted", deletedCount: 1})
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(inboxId).get().then((inbox) => {
                if (!inbox.exists) {
                    callback(true, {id: inboxId, data: "Not Found", deletedCount: 0, returned: inbox});
                } else {
                    const data = inbox.data();
                    if (data!.org === org) {
                        this.db.collection(this.collection).doc(inboxId).delete().then(() => {
                            callback(false, {id: inboxId, data: "was deleted", deletedCount: 1})
                        }).catch((error) => {
                            console.error(error)
                            callback(true, error);
                        })
                    } else {
                        callback(true, {id: inboxId, data: "Not Permitted", deletedCount: 0});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }

    public query(org: string, participantId: any, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection)
                .where("participantId", "==", participantId)
                .get().then((inboxQuerySnapshot) => {
                    this.processInbox(inboxQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .where("participantId", "==", participantId)
                .get()
                .then((inboxQuerySnapshot) => {
                    this.processInbox(inboxQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }


    public update(org:string, data: any, callback: CallbackFunction) {
        this.db.collection(this.collection).doc(data.id).set(data.inbox, {merge: true})
            .then(() => {
                callback(false, {id: data.id, data: "updated"});
            })
            .catch((error) => {
                console.error(error)
                callback(true, error);
            })
    }


}

