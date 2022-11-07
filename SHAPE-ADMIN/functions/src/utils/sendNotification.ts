import { formatISO } from 'date-fns';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import * as functions from 'firebase-functions';
import { InAppNotification, Inbox, MailOptions, User } from '../interfaces/DataTypes';
import { guid, isEmptyObject } from './utils';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import _ from 'lodash';

const envVars = functions.config();
const TWILIOSID = envVars.twilio.sid;
const twilioToken = envVars.twilio.token;
const smsClient = require('twilio')(TWILIOSID, twilioToken);

const transporter = nodemailer.createTransport({
    service: envVars.email.service,
    secure: true,
    auth: {
        user: envVars.email.user,
        pass: envVars.email.password
    }
});

// from api
const addNotificationToDatabase = (d: any, org: string, publicAccess: boolean) => {
    console.log('addNotificationToDatabase()');
    const db = getFirestore();
    const collection = 'message';

    const data = { ...d };
    data.org = org;

    if (publicAccess) {
        data.inAppRecipients = data.inAppRecipients.map((e: User) => e.docId);
        data.pushRecipients = data.pushRecipients.map((e: User) => e.docId);
        data.emailRecipients = data.emailRecipients.map((e: User) => e.docId);
        data.smsRecipients = data.smsRecipients.map((e: User) => e.docId);
    } else {
        data.inAppRecipients = data.inAppRecipients.map(
            (e: User) => e.participantId.filter((elem) => elem.org === org)[0].id
        );
        data.pushRecipients = data.pushRecipients.map(
            (e: User) => e.participantId.filter((elem) => elem.org === org)[0].id
        );
        data.emailRecipients = data.emailRecipients.map(
            (e: User) => e.participantId.filter((elem) => elem.org === org)[0].id
        );
        data.smsRecipients = data.smsRecipients.map(
            (e: User) => e.participantId.filter((elem) => elem.org === org)[0].id
        );
    }

    console.log('data', data);
    return db
        .collection(collection)
        .add(data)
        .then((newDoc: any) => {
            return true;
        })
        .catch((error) => {
            console.error(error);
            return false;
        });
};

// from api
const createInbox = (inboxRecord: Inbox) => {
    console.log('createInbox()');
    const db = getFirestore();

    const collection = 'inbox';

    return db
        .collection(collection)
        .add(inboxRecord)
        .then((newDoc: any) => {
            return true;
        })
        .catch((error) => {
            console.error(error);
            return false;
        });
};

// from functions index.tsx
export const sendAppNotification = (message: InAppNotification) => {
    console.log('sendAppNotification()');
    return getMessaging().sendMulticast(message);
};

// from functions index.tsx
export const sendTextNotification = (phoneNumber: string, message: string) => {
    console.log('sendTextNotification()');
    return smsClient.messages.create({
        body: message,
        from: envVars.twilio.number,
        to: phoneNumber
    });
};

// from functions index.tsx
export const sendEmailNotification = (
    mailOptions: MailOptions,
    callback: (err: Error | null, info: SMTPTransport.SentMessageInfo) => void
) => {
    console.log('sendEmailNotification()');
    return transporter.sendMail(mailOptions, callback);
};

export const getUsersFromParticipantList = async (
    participantList: string[],
    org: string,
    publicAccess: boolean
) => {
    console.log('getUsersFromParticipantList()');
    const db = getFirestore();
    console.log('participantList', participantList);
    console.log('org', org);
    console.log('publicAccess', publicAccess);

    const userList: User[] = [];
    for (const participant of participantList) {
        if (publicAccess) {
            const userDoc = await db
                .collection('users')
                .doc(participant)
                .get()
                .catch((error) => {
                    console.error(error);
                });
            if (userDoc) {
                const user = userDoc.data() as User;
                user.docId = userDoc.id;
                console.log('user', user);
                userList.push(user);
            }
        } else {
            const participantDoc = await db
                .collection('participant')
                .where('org', '==', org)
                .where('participantId', '==', participant)
                .get()
                .catch((error) => {
                    console.error(error);
                });
            if (!participantDoc) {
                console.error(`participantDoc for ${participant} not found`);
                continue;
            }
            console.log('docId', participantDoc.docs[0].id);
            console.log('participantId', participantDoc.docs[0].get('participantId'));
            console.log('userId', participantDoc.docs[0].get('userId'));
            const userDoc = await db
                .collection('users')
                .doc(participantDoc.docs[0].get('userId'))
                .get()
                .catch((error) => {
                    console.error(error);
                });
            if (userDoc && userDoc.exists) {
                console.log(userDoc.get('userName'));
                const user = userDoc.data() as User;
                user.docId = userDoc.id;
                console.log('user', user);
                userList.push(user);
            } else {
                console.error('userDoc is void');
            }
        }
    }
    return userList;
};

export function sendToInbox(subject: string, message: string, timestamp: string, users: User[], org: string) {
    console.log('sendToInbox()');
    users.forEach((user: User) => {
        return new Promise<void>((resolve: any) => {
            const filteredId = user.participantId.filter((elem) => elem.org === org);
            const id = guid();
            const record = {
                subject: subject,
                message: message,
                timestamp: timestamp,
                read: false,
                id: id,
                participantId: '' as any,
                userId: '' as any,
                org
            };
            record.participantId = filteredId.length > 0 ? filteredId[0].id : user.docId;
            record.userId = user.docId;
            console.log('record', record);
            createInbox(record).catch((e: any) => {
                console.error(e);
                resolve();
            });
        });
    });

    return Promise.all(users);
}

export const sendNotification = async (
    rawParticipantList: string[],
    org: string,
    subject: string,
    message: string,
    publicAccess: boolean
) => {
    const participantList = _.uniq(rawParticipantList);
    console.log('sendNotification()');
    console.log('participantList', participantList);
    console.log('org', org);
    console.log('subject', subject);
    console.log('message', message);
    console.log('publicAccess', publicAccess);

    const timestamp = formatISO(new Date());
    console.log('timestamp', timestamp);
    if (!isEmptyObject(message) && !isEmptyObject(subject) && !isEmptyObject(participantList)) {
        const usersToNotify: User[] = await getUsersFromParticipantList(participantList, org, publicAccess);

        console.log('usersToNotify', usersToNotify);
        const checkedEmailList = usersToNotify.filter((user) => user.emailEnabled);
        const checkedSMSList = usersToNotify.filter((user) => user.smsEnabled);
        const checkedPushList = usersToNotify.filter((user) => user.pushEnabled);
        const messageData = {
            subject: subject,
            message: message,
            timestamp: timestamp,
            emailRecipients: checkedEmailList,
            smsRecipients: checkedSMSList,
            pushRecipients: checkedPushList,
            inAppRecipients: usersToNotify
        };
        console.log('usersToNotify', usersToNotify.length);
        console.log('checkedEmailList', checkedEmailList.length);
        console.log('checkedSMSList', checkedSMSList.length);
        console.log('checkedPushList', checkedPushList.length);
        if (
            !isEmptyObject(checkedEmailList) ||
            !isEmptyObject(checkedSMSList) ||
            !isEmptyObject(checkedPushList) ||
            !isEmptyObject(usersToNotify)
        ) {
            const notificationWritten = await addNotificationToDatabase(messageData, org, publicAccess);

            if (notificationWritten) {
                if (!isEmptyObject(usersToNotify)) {
                    sendToInbox(subject, message, timestamp, usersToNotify, org).catch((error) => {
                        console.error(error);
                    });
                }
                if (!isEmptyObject(checkedPushList)) {
                    try {
                        const deviceTokens: string[] = checkedPushList
                            .filter((participant: User) => {
                                return participant.pushEnabled === true && !isEmptyObject(participant.token);
                            })
                            .map((e: User) => e.token as string);
                        if (!isEmptyObject(deviceTokens)) {
                            const appMessage: InAppNotification = {
                                notification: {
                                    title: subject,
                                    body: message
                                },
                                tokens: deviceTokens
                            };
                            sendAppNotification(appMessage)
                                .then((response: any) => {
                                    console.log(response.successCount + ' messages were sent successfully');
                                })
                                .catch((error: any) => {
                                    console.error('Error sending message:', error);
                                });
                        } else {
                            console.error('push tokens were empty');
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
                if (!isEmptyObject(checkedEmailList)) {
                    try {
                        for (const r in checkedEmailList) {
                            const mailOptions = {
                                from: 'SHAPE Application <noreply@patientexperience.app>',
                                replyTo: 'noreply@patientexperience.app',
                                to: checkedEmailList[r].userName, //email address
                                subject: subject, // email subject
                                html: `<p style="font-size: 16px;"></p> ${message}<br />` // email content in HTML
                            };
                            sendEmailNotification(mailOptions, (error: any) => {
                                if (error) {
                                    console.log(error.toString());
                                }
                                console.log(`Email sent to ${checkedEmailList[r].userName}`);
                            });
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
                if (!isEmptyObject(checkedSMSList)) {
                    try {
                        const s = subject;
                        const m = message;
                        const msg = `\n\n${s} - \n${m}`;
                        const phoneNumbers = checkedSMSList.map((user) => user.phoneNumber);
                        const formattedPhoneNums = phoneNumbers.map((number: string) => {
                            return '+1' + number.replace(/[^0-9]/g, '');
                        });
                        const smsPromises = formattedPhoneNums.map((num: any) => {
                            return sendTextNotification(num, msg);
                        });
                        Promise.all(smsPromises)
                            .then((statuses: any) => {
                                console.log('sms statuses', JSON.stringify(statuses));
                            })
                            .catch((e: any) => {
                                console.error(e);
                            });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        } else {
            console.error(
                'All checked participant lists are empty.',
                'checkedEmailList',
                checkedEmailList,
                'checkedInAppList',
                checkedPushList,
                'checkedSMSList',
                checkedSMSList,
                'usersToNotify',
                usersToNotify
            );
        }
    } else {
        console.error(
            'sendNotification(): ParticipantList, Subject, or Message was empty.',
            'ParticipantList',
            participantList.length,
            'Subject',
            subject,
            'Message',
            message
        );
    }
};
