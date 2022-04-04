import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";

admin.initializeApp(functions.config().firebase, 'ehr');

export class EHRService {
    bucket = admin.storage().bucket();    
    db = admin.firestore();
    collection = "ehr";

    private processEHR(ehrQuerySnapshot:any, callback: CallbackFunction) {
        const receipts: ResponseData[] = [];
        ehrQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
            receipts.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        callback(false, receipts);
    }

    public getAll(org:string, callback: CallbackFunction) {
        if (org === 'ALL') {
            this.db.collection(this.collection)
                .get()
                .then((ehrQuerySnapshot: any) => {
                    this.processEHR(ehrQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .get()
                .then((ehrQuerySnapshot: any) => {
                    this.processEHR(ehrQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }

    private filter(org:string, participantId:string, participantName:string, dob: string, callback: CallbackFunction) {
        this.db.collection(this.collection).where("org", "==", org).where("participantId", "==", participantId).get().then((ehrQuerySnapshot: any) => {
            if(!ehrQuerySnapshot.empty) {
                ehrQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
                    const data = doc.data();
                    const receipts = data.receipts
                        .filter((receipt: any) => {
                            return receipt.profile.name === participantName && receipt.profile.dob.replace(/\D/g, "") === dob;
                        })
                        .map((receipt: any) => {
                            return receipt.path;
                        })
                    callback(false, receipts);
                });
            } else {
                callback(true, "no such ehr found");
            }
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }

    public get(org: string, query: any, callback: CallbackFunction) {
        const {respondentId, participantName, dob} = query;
        this.filter(org, respondentId, participantName, dob, (err: boolean, receipts: any) => {
            if (!err){
                const promises = [];
                for (const receipt of receipts) {
                    promises.push(new Promise((resolve, reject) => {
                        const file = this.bucket.file(`${org}/ehr/${receipt}`);
                        file.getSignedUrl({
                            action: 'read',
                            expires: '03-09-2491'
                        })
                        .then((signedUrls: any) => {
                            resolve(signedUrls[0]);
                        })
                        .catch(e => {
                            console.error("error getting signed url");
                            resolve(e);
                        })
                    }));
                }
    
                Promise.all(promises)
                    .then((res) => {
                        callback(false, res);
                    })
                    .catch((error) => {
                        callback(true, error);
                    })
            } else {
                callback(true, err);
            }
            
        });
    }

    public find(org: string, path: any, callback: CallbackFunction) {
        const file = this.bucket.file(`${org}/ehr/${path}`);
        file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        })
        .then((signedUrls: any) => {
            callback(false, signedUrls[0]);
        })
        .catch(error => {
            console.error("error finding signed url");
            callback(true, error);
        })
    }
}

