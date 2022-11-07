import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import { CallbackFunction, ResponseData } from "../interfaces/components";
import {Message} from "../interfaces";


initializeApp(functions.config().firebase, 'message');

export class MessageService {
    db = getFirestore();
    collection = "message";

    public create(message: Message, callback: CallbackFunction) {
        this.db.collection(this.collection).add(message).then((newDoc: any) => {
            callback(false, JSON.stringify(newDoc));
        }).catch((error) => {
            console.error(error)
            callback(true, error);
        })
    }

    public getAll(org:string, callback: CallbackFunction) {
        if(org === "ALL") {
            this.db.collection(this.collection).get().then((messageQuerySnapshot: any) => {
                this.processMessage(messageQuerySnapshot, callback);
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        } else {
            this.db.collection(this.collection).where("org", "==", org).get().then((messageQuerySnapshot: any) => {
                this.processMessage(messageQuerySnapshot, callback);
            }).catch((error) => {
                console.error(error)
                callback(true, error);
            })
        }
    }

    public query(org: string, participantId: any, callback: CallbackFunction) {
      if(org === "ALL") {
          const emailPromise = this.createALLPromise("emailRecipients", participantId, callback);
          const smsPromise = this.createALLPromise("smsRecipients", participantId, callback);
          const inAppPromise = this.createALLPromise("inAppRecipients", participantId, callback);

          Promise.all([emailPromise, smsPromise, inAppPromise]).then((values: any[]) => {
              this.processPromises(values, callback);
          })
          .catch((error) => {
              console.error(error)
              callback(true, error);
          })
      } else {
          const emailPromise = this.createORGPromise("emailRecipients", participantId, org, callback);
          const smsPromise = this.createORGPromise("smsRecipients", participantId, org, callback);
          const inAppPromise = this.createORGPromise("inAppRecipients", participantId, org, callback);

          Promise.all([emailPromise, smsPromise, inAppPromise]).then((values: any[]) => {
              this.processPromises(values, callback);
          })
          .catch((error) => {
              console.error(error)
              callback(true, error);
          })
      }

  }

  public filter(org:string, query: any, callback: CallbackFunction) {
      if(org === "ALL") {
          this.db.collection(this.collection).doc(query.messageId).get().then((message) => {
              if (!message.exists) {
                  callback(true, {id: query.messageId, data: "Not Found", returned: message});
              } else {
                  callback(false, {id: message.id, data: message.data()})
              }
          }).catch((error) => {
              console.error(error)
              callback(true, error);
          })
      } else {
          this.db.collection(this.collection).doc(query.messageId).get().then((message) => {
              if (!message.exists) {
                  callback(true, {id: query.messageId, data: "Not Found", returned: message});
              } else {
                  const data = message.data();
                  if(data!.org === org) {
                      callback(false, {id: message.id, data: message.data()})
                  } else {
                      callback(true, {id: query.messageId, data: "Not Permitted", returned: {}});
                  }
              }
          }).catch((error) => {
              console.error(error)
              callback(true, error);
          })
      }
  }

    private processMessage(messageQuerySnapshot: any, callback: CallbackFunction) {
      const messages: ResponseData[] = [];
      messageQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
          messages.push({
              id: doc.id,
              data: doc.data(),
          });
      });
      callback(false, messages);
  }

  private processMessagePromise(messageQuerySnapshot: any, resolve: any) {
      const messages: ResponseData[] = [];
      messageQuerySnapshot.forEach((doc: { id: string; data: () => any }) => {
          messages.push({
              id: doc.id,
              data: doc.data(),
          });
      });
      resolve(messages);
  }

    private createALLPromise(type: string, participantId: string, callback: CallbackFunction) {
        return new Promise((resolve) => {
            this.db.collection(this.collection)
                .where(type, "array-contains", participantId)
                .get()
                .then((messageSnapshot) => {
                    this.processMessagePromise(messageSnapshot, resolve);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        })
    }

    private createORGPromise(type: string, participantId: string, org:string, callback: CallbackFunction) {
        return new Promise((resolve) => {
            this.db.collection(this.collection)
                .where("org", "==", org)
                .where(type, "array-contains", participantId)
                .get()
                .then((messageSnapshot) => {
                    this.processMessagePromise(messageSnapshot, resolve);
                }).catch((error) => {
                    console.error(error)
                    callback(true, error);
                })
        })
    }

    private processPromises (values: any[], callback: CallbackFunction) {
        let ids = new Set(values[0].map((elem: any) => elem.id));
        const initialMerge = [...values[0], ...values[1].filter((elem: any) => !ids.has(elem.id))];
        ids = new Set(initialMerge.map((elem: any) => elem.id));
        const finalMerge = [...initialMerge, ...values[2].filter((elem: any) => !ids.has(elem.id))];
        callback(false, finalMerge);
    }
}

