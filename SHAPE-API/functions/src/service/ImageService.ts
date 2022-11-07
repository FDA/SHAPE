import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";
import { Readable } from "stream";

initializeApp(functions.config().firebase, 'image');

export class ImageService {
    bucket = getStorage().bucket();
    db = getFirestore();
    collection = "image";

    private processImage(imageQuerySnapshot:any, callback: CallbackFunction) {
        const images: ResponseData[] = [];
        imageQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
            images.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        callback(false, images);
    }

    public create(org: string, image: any, callback: CallbackFunction) {
        const imgBuffer = Buffer.from(image.data, 'base64');

        const file = this.bucket.file(`${org}/image/${image.id}`);

        const s = new Readable();
        s.push(imgBuffer)   
        s.push(null) 
        s.pipe(file.createWriteStream({
            metadata: {
                contentType: 'image/jpeg',
                customMetadata: {
                    "fileName": image.fileName,
                    "org": image.org
                }
            },
        }))
        .on('error', (error: any) => {
            callback(true, error);
        })
        .on('finish', () => {
            this.db.collection(this.collection).doc(image.id).set({
                fileName: image.fileName,
                org: image.org,
                storageId: image.id
            }).then((newDoc: any) => {
                callback(false, {id: newDoc.id});
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        });
    }

    public filter(org:string, query: any, callback: CallbackFunction) {
        if(org === "ALL") {
            const file = this.bucket.file(`${org}/image/${query.imageId}`);
    
            file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            })
            .then((signedUrls: any) => {
                callback(false, {success: true, url: signedUrls[0]});
            })
            .catch(err => {
                console.error(`Unable to get image ${err}`)
                callback(true, err);
            })
        } else {
            this.db.collection(this.collection).doc(query.imageId).get().then((image) => {
                if (!image.exists) {
                    callback(true, {id: query.imageId, data: "Not Found", returned: image});
                } else {
                    const data = image.data();
                    if (data!.org === org) {
                        const file = this.bucket.file(`${org}/image/${query.imageId}`);
                
                        file.getSignedUrl({
                            action: 'read',
                            expires: '03-09-2491'
                        })
                        .then((signedUrls: any) => {
                            callback(false, {success: true, url: signedUrls[0]});
                        })
                        .catch(err => {
                            console.error(`Unable to get image ${err}`)
                            callback(true, err);
                        })
                    } else {
                        callback(true, {id: query.imageId, data: "Not Permitted", returned: {}});
                    }
                }
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }

    public getAll(org: string, callback: CallbackFunction) {
        if (org === 'ALL') {
            this.db.collection(this.collection)
                .get()
                .then((imageQuerySnapshot: any) => {
                    this.processImage(imageQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        } else {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .get()
                .then((imageQuerySnapshot: any) => {
                    this.processImage(imageQuerySnapshot, callback);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        }
    }
}

