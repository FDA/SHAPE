import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";
import { History } from "../interfaces"

initializeApp(functions.config().firebase, 'ehr');

export class EHRService {
    bucket = getStorage().bucket();    
    db = getFirestore();
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

    private filter(org:string, surveyId:string, participantId:string, profileId:string, callback: CallbackFunction) {
        this.db.collection(this.collection)
            .where("org", "==", org)
            .where("participantId", "==", participantId)
            .where("surveyId", "==", surveyId)
            .get()
            .then((ehrQuerySnapshot: any) => {
                if(!ehrQuerySnapshot.empty) {
                    ehrQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
                        const data = doc.data();
                        const receipts = data.receipts
                            .filter((receipt: any) => {
                                return receipt.profile.id === profileId;
                            })
                            .map((receipt: any) => {
                                return receipt.path;
                            })
                        callback(false, receipts);
                    });
                } else {
                    callback(false, "no such ehr found");
                }
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }

    public get(org: string, query: any, callback: CallbackFunction) {
        const {surveyId, respondentId, profileId} = query;
        this.filter(org, surveyId, respondentId, profileId, (err: boolean, receipts: any) => {
            if (!err && typeof(receipts) === "object"){
                const promises = [];
                for (const receipt of receipts) {
                    promises.push(new Promise((resolve) => {
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
                        const log:History = {
                            actionType: "ehrExported",
                            org: org,
                            participantId: respondentId,
                            questionnaireId: "",
                            surveyId: surveyId,
                            timestamp: new Date(),
                            userId: profileId
                        }
                
                        this.db.collection("history")
                            .add(log)
                            .then(() => {
                                callback(false, res);
                            })
                            .catch((error) => {
                                callback(true, error);
                            })
                    })
                    .catch((error) => {
                        callback(true, error);
                    })
            } else if (!err && typeof(receipts) === "string") { 
                callback(false, receipts)
            } else {
                callback(true, err);
            }
            
        });
    }

    public find(org: string, path: any, callback: CallbackFunction) {
        const file = this.bucket.file(`${org}/ehr/${path}`);

        const log:History = {
            actionType: "ehrExported",
            org: org,
            participantId: "",
            questionnaireId: "",
            surveyId: "",
            timestamp: new Date(),
            userId: path
        }

        file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            })
            .then((signedUrls: any) => {
                this.db.collection("history")
                .add(log)
                .then(() => {
                    callback(false, signedUrls[0]);
                })
                .catch((err) => {
                    callback(true, err);
                })
            })
            .catch(error => {
                console.error("error finding signed url");
                callback(true, error);
            })
    }
}

