import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import { CallbackFunction } from "../interfaces/components";
import {User} from "../interfaces";

initializeApp(functions.config().firebase, 'users');

export class UserService {
    db = getFirestore();
    collection = "users";

    /* Only use this for testing with emulators. */
    public create(user: User, callback: CallbackFunction) {
        this.db.collection(this.collection).add(user).then((newDoc: any) => {
            callback(false, {id: newDoc.id});
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }

    private processUsers(userQuerySnapshot:any, callback: CallbackFunction) {
        const users: any[] = [];
        userQuerySnapshot.forEach((doc: { id: any; data: () => any }) => {
            users.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        callback(false, users);
    }

    public getAll(org: string, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection)
                .get()
                .then((userQuerySnapshot: any) => {
                    this.processUsers(userQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "array-contains", org)
                .get()
                .then((userQuerySnapshot: any) => {
                    this.processUsers(userQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }

    //TODO: Fix this to work with participantId map
    public query(org: string, participantId: any, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection)
                .where("participantId", "==", participantId)
                .get()
                .then((userSnapshot:any) => {
                    this.processUsers(userSnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .where("participantId", "==", participantId)
                .get()
                .then((userSnapshot) => {
                    this.processUsers(userSnapshot, callback);
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
                .then((userSnapshot: any) => {
                    this.processUsers(userSnapshot, callback);
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
                .where("org", "array-contains", org)
                .get()
                .then((userSnapshot: any) => {
                    this.processUsers(userSnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
            }
    }

    public filter(org: string, query: any, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection).doc(query.userId).get().then((user) => {
                if (!user.exists) {
                    callback(true, {id: query.userId, data: "Not Found", returned: user});
                } else {
                    callback(false, {id: user.id, data: user.data()})
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(query.userId).get().then((user) => {
                if (!user.exists) {
                    callback(true, {id: query.userId, data: "Not Found", returned: user});
                } else {
                    /*const u = user.data();
                    if(u!.org === org) {// admins need to be able to fetch public user information
                        callback(false, {id: user.id, data: user.data()})
                    } else { 
                        callback(true, {id: query.userId, data: "Not Permitted", returned: {}});
                    }*/
                    callback(false, {id: user.id, data: user.data()});
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }

    /* // User API only allows for the modification of the active property  */
    public update(org:string, data: any, callback: CallbackFunction) {
        if (org === "ALL") {
            this.db.collection(this.collection).doc(data.id).get().then((user) => {
                if (!user.exists) {
                    callback(true, {id: data.id, data: "Not Found", returned: user});
                } else {
                    this.db.collection(this.collection).doc(data.id).set(data.user, {merge: true})
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
            this.db.collection(this.collection).doc(data.id).get().then((user) => {
                if (!user.exists) {
                    callback(true, {id: data.id, data: "Not Found", returned: user});
                } else {
                    const u = user.data();
                    if(u!.org === org) {
                        this.db.collection(this.collection).doc(data.id).set(data.user, {merge: true})
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

