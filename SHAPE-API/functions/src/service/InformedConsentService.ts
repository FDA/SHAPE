import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";
import {InformedConsent} from "../interfaces";


initializeApp(functions.config().firebase, 'informed-consent');

export class InformedConsentService {

    db = getFirestore();
    collection = "informed-consent";

    private processInformedConsent(dataQuerySnapshot:any, callback: CallbackFunction) {
        const informedConsents: ResponseData[] = [];
        dataQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
            informedConsents.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        callback(false, informedConsents);
    }

    query(org:string, surveyId: any, callback: CallbackFunction) {
        if (org === 'ALL') {
            this.db.collection(this.collection)
                .where("surveyId", "==", surveyId)
                .get().then((dataQuerySnapshot) => {
                    this.processInformedConsent(dataQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("surveyId", "==", surveyId)
                .where("org", "==", org)
                .get().then((dataQuerySnapshot) => {
                    this.processInformedConsent(dataQuerySnapshot, callback);
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }

    }

    getAll(org:string, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection)
                .get()
                .then((participantQuerySnapshot: any) => {
                    this.processInformedConsent(participantQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .get()
                .then((participantQuerySnapshot: any) => {
                    this.processInformedConsent(participantQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }

    filter(org:string, query: { informedConsentId: string }, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection).doc(query.informedConsentId).get().then((informedConsent) => {
                if (!informedConsent.exists) {
                    callback(true, {id: query.informedConsentId, data: "Not Found", returned: informedConsent});
                } else {
                    callback(false, {id: informedConsent.id, data: informedConsent.data()})
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).doc(query.informedConsentId).get().then((informedConsent) => {
                if (!informedConsent.exists) {
                    callback(true, {id: query.informedConsentId, data: "Not Found", returned: informedConsent});
                } else {
                    const data = informedConsent.data();
                    if (data!.org === org) {
                        callback(false, {id: informedConsent.id, data: informedConsent.data()})
                    } else {
                        callback(true, {id: query.informedConsentId, data: "Not Permitted", returned: {}});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }

    }

    create(informedConsent: InformedConsent, callback: CallbackFunction) {
        this.db.collection(this.collection)
            .add(informedConsent).then((newDoc: any) => {
            callback(false, newDoc);
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })

    }

    update(informedConsent: InformedConsent, callback: CallbackFunction) {
        this.db.collection(this.collection)
            //@ts-ignore
            .doc(informedConsent.id)
            .set(informedConsent, {merge: true})
            .then(() => {
                callback(false, informedConsent);
            })
            .catch((error:any) => {
                console.error(error)
                callback(true, error);
            })
    }

    delete(id: string, callback: CallbackFunction) {
        this.db.collection(this.collection)
            .doc(id)
            .delete()
            .then(() => {
                callback(false, {deletedCount: 1});
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
    }
}
