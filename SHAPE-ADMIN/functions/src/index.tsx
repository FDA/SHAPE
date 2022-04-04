import * as request from 'request';
import {
    getBearerToken,
    getNewAuthCode,
    getPatient,
    getPatientEHR,
    getUserCode,
    getUserList,
    search
} from './1upHealth';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const nodemailer = require('nodemailer');

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

admin.initializeApp();

exports.getEnvVar = functions.https.onCall((data: any, context: any) => {
    try {
        return functions.config();
    } catch (error) {
        console.error(error);
        return error;
    }
});

exports.getUser = functions.https.onCall((data: any, context: any) => {
    return admin
        .auth()
        .getUser(data.uid)
        .then(function (userRecord: any) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully fetched user data:', userRecord.toJSON());
            return userRecord.toJSON();
        })
        .catch(function (error: any) {
            console.log('Error fetching user data:', error);
        });
});

exports.disableUser = functions.https.onCall((data: any, context: any) => {
    let uid = data.uid;
    return admin
        .auth()
        .updateUser(uid, {
            disabled: true
        })
        .then(function (userRecord: any) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully disabled user:', userRecord.toJSON());
            admin
                .auth()
                .revokeRefreshTokens(uid)
                .then(() => {
                    return admin.auth().getUser(uid);
                })
                .then((usrRecord: any) => {
                    return (
                        new Date(usrRecord.tokensValidAfterTime).getTime() /
                        1000
                    );
                })
                .then((timestamp: any) => {
                    console.log('Tokens revoked at: ', timestamp);
                    return userRecord.toJSON();
                });
        })
        .catch(function (error: any) {
            console.log('Error fetching user data:', error);
        });
});

exports.enableUser = functions.https.onCall((data: any, context: any) => {
    return admin
        .auth()
        .updateUser(data.uid, {
            disabled: false
        })
        .then(function (userRecord: any) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully enabled user:', userRecord.toJSON());
            return userRecord.toJSON();
        })
        .catch(function (error: any) {
            console.log('Error fetching user data:', error);
        });
});

exports.sendEmailNotification = functions.https.onCall(
    (data: any, context: any) => {
        // Since this code will be running in the Cloud Functions environment
        // we call initialize Firestore without any arguments because it
        // detects authentication from the environment.
        let {emailRecipients, subject, message} = data;

        try {
            for (let r in emailRecipients) {
                const mailOptions = {
                    from: 'SHAPE Application <noreply@patientexperience.app>',
                    replyTo: 'noreply@patientexperience.app',
                    to: emailRecipients[r].userName, //email address
                    subject: subject, // email subject
                    html: `<p style="font-size: 16px;"></p> ${message}
                <br />` // email content in HTML
                };

                transporter.sendMail(
                    mailOptions,
                    (error: any, info: string) => {
                        if (error) {
                            console.log(error.toString());
                        }
                        console.log(
                            `Email sent to ${emailRecipients[r].userName}`
                        );
                    }
                );
            }
        } catch (error) {
            console.error(error);
        }
    }
);

exports.sendMail = functions.https.onRequest((req: any, res: any) => {
    cors(req, res, () => {
        // Since this code will be running in the Cloud Functions environment
        // we call initialize Firestore without any arguments because it
        // detects authentication from the environment.
        const firestore = admin.firestore();

        // getting dest email by query string
        const recipient = req.body.recipient;
        const surveyId = req.body.surveyId;
        console.log(`Recieved parameters ${recipient} and ${surveyId}`);
        firestore
            .collection('survey')
            .doc(surveyId)
            .get()
            .then((doc: any) => {
                const survey = doc.data();
                console.log(`Inside Snapshot got ${survey}`);
                const {informedConsent, name} = survey;
                const mailOptions = {
                    from: 'SHAPE Application <noreply@patientexperience.app>',
                    replyTo: 'noreply@patientexperience.app',
                    to: recipient,
                    subject: `Informed Consent for Survey: ${name}`, // email subject
                    html: `<p style="font-size: 16px;"></p> ${informedConsent}
                <br />` // email content in HTML
                };
                // returning result
                return transporter.sendMail(
                    mailOptions,
                    (erro: any, info: string) => {
                        if (erro) {
                            return res.send(erro.toString());
                        }
                        return res.send(
                            `Informed Consent email sent to ${recipient} for ${name}`
                        );
                    }
                );
            })
            .catch((err: any) => {
                console.error(err);
            });
    });
});

exports.createCustomToken = functions.https.onRequest(
    async (req: any, res: any) => {
        let userId = envVars.shape_preview.user;
        let additionalClaims = {
            admin: true
        };
        cors(req, res, async () => {
            try {
                const customToken = await admin
                    .auth()
                    .createCustomToken(userId, additionalClaims);
                res.send(customToken);
            } catch (e) {
                console.error(e);
                res.sendStatus(500);
            }
        });
    }
);

exports.sendSms = functions.https.onRequest((req: any, res: any) => {
    cors(req, res, async () => {
        try {
            const subject = req.body.subject;
            const message = req.body.message;
            const msg = `\n\n${subject} - \n${message}`;
            const phoneNumbers = req.body.phoneNumbers;
            const smsPromises = phoneNumbers.map((num: any) => {
                return smsClient.messages.create({
                    body: msg,
                    from: envVars.twilio.number,
                    to: num
                });
            });
            Promise.all(smsPromises)
                .then((statuses: any) => {
                    res.type('json').send(JSON.stringify(statuses));
                })
                .catch((e: any) => {
                    console.error(e);
                    res.sendStatus(500);
                });
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }
    });
});

exports.sendNotification = functions.https.onRequest(
    async (req: any, res: any) => {
        cors(req, res, async () => {
            try {
                const message = req.body.message;
                admin
                    .messaging()
                    .sendMulticast(message)
                    .then((response: any) => {
                        console.log(
                            response.successCount +
                                ' messages were sent successfully'
                        );
                    })
                    .catch((error: any) => {
                        console.error('Error sending message:', error);
                    });
            } catch (e) {
                console.error(e);
                res.sendStatus(500);
            }
        });
    }
);

exports.createNotificationKey = functions.https.onRequest(
    async (req: any, res: any) => {
        cors(req, res, async () => {
            const userId = req.body.userId;
            const deviceId = req.body.deviceId;

            _firebaseNotificationKeyRequest('create', userId, [deviceId])
                .then((r: any) => {
                    res.sendStatus(200);
                })
                .catch((e) => {
                    console.error(e);
                    res.sendStatus(500);
                });
        });
    }
);

exports.addDeviceToNotificationKey = functions.https.onRequest(
    async (req: any, res: any) => {
        cors(req, res, async () => {
            const userId = req.body.userId;
            const deviceId = req.body.deviceId;
            const notificationKey = req.body.notificationKey;

            _firebaseNotificationKeyRequest(
                'add',
                userId,
                [deviceId],
                notificationKey
            )
                .then((r) => {
                    res.sendStatus(200);
                })
                .catch((e) => {
                    console.error(e);
                });
        });
    }
);

exports.removeDeviceFromNotificationKey = functions.https.onRequest(
    async (req: any, res: any) => {
        cors(req, res, async () => {
            const userId = req.body.userId;
            const deviceId = req.body.deviceId;
            const notificationKey = req.body.notificationKey;

            _firebaseNotificationKeyRequest(
                'remove',
                userId,
                [deviceId],
                notificationKey
            )
                .then((r) => {
                    res.sendStatus(200);
                })
                .catch((e) => {
                    console.error(e);
                });
        });
    }
);

const _firebaseNotificationKeyRequest = (
    operation: 'create' | 'add' | 'remove',
    notificationKeyName: string,
    registrationIds: string[],
    notificationKey?: string
) => {
    return new Promise((resolve, reject) => {
        let data = {
            operation: operation,
            notification_key_name: notificationKeyName,
            registration_ids: registrationIds,
            notification_key: notificationKey
        };
        if (!notificationKey) {
            delete data.notification_key;
        }
        let options = {
            url: 'https://fcm.googleapis.com/fcm/send',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `key=${envVars.fcm.key}`,
                project_id: envVars.fcm.project_id
            },
            json: true,
            body: data
        };
        request.post(options, (err: any, response: any, body: any) => {
            if (!!body.error) reject(body.error);
            else {
                resolve(body.notification_key);
            }
        });
    });
};

exports.getUserList = functions.https.onRequest(async (req: any, res: any) => {
    cors(req, res, async () => {
        getUserList(req, res);
    });
});
exports.getUserCode = functions.https.onRequest(async (req: any, res: any) => {
    cors(req, res, async () => {
        getUserCode(req, res);
    });
});
exports.getNewAuthCode = functions.https.onRequest(
    async (req: any, res: any) => {
        cors(req, res, async () => {
            getNewAuthCode(req, res);
        });
    }
);
exports.getBearerToken = functions.https.onRequest(
    async (req: any, res: any) => {
        cors(req, res, async () => {
            getBearerToken(req, res);
        });
    }
);
exports.search = functions.https.onRequest(async (req: any, res: any) => {
    cors(req, res, async () => {
        search(req, res);
    });
});
exports.getPatient = functions.https.onRequest(async (req: any, res: any) => {
    cors(req, res, async () => {
        getPatient(req, res);
    });
});
exports.getPatientEHR = functions.https.onRequest(
    async (req: any, res: any) => {
        cors(req, res, async () => {
            getPatientEHR(req, res)
                .then(() => console.log('getPatientEHR Done.'))
                .catch((err) => {
                    console.error(`Error on getPatientEHR ${err}`);
                });
        });
    }
);

exports.setAdmin = functions.https.onCall((data: any, context: any) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called ' + 'while authenticated.'
        );
    }
    const email = data.email;
    const org = data.org ? data.org : 'ALL';
    console.log(`Setting Admin flag in setAdmin for ${email} on org: ${org}`);
    return admin
        .auth()
        .getUserByEmail(email)
        .then((result: any) => {
            return admin
                .auth()
                .setCustomUserClaims(result.uid, {admin: true, org: org})
                .then(() => {
                    console.log(
                        `Successfully setAdmin for userId ${result.uid}, returning true`
                    );
                    return {success: true};
                })
                .catch((err: any) => {
                    console.error(
                        `Unable to set Admin custom claims for ${email} for org ${org}, returning false`
                    );
                    return {success: false};
                });
        })
        .catch((err: any) => {
            console.error(
                `Unable to find user by email ${email}, returning false`
            );
            return {success: false};
        });
});

exports.getCustomClaims = functions.https.onCall((data: any, context: any) => {
    return admin
        .auth()
        .getUserByEmail(data.email)
        .then((res: any) => {
            if (res.customClaims) {
                return res.customClaims;
            } else {
                return null;
            }
        });
});

exports.setParticipantId = functions.https.onCall((data: any, context: any) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called ' + 'while authenticated.'
        );
    }
    const email = data.email;
    return admin
        .auth()
        .getUserByEmail(email)
        .then((result: any) => {
            if (result.customClaims && result.customClaims.participantId) {
                console.log(
                    `result.uid already has claims ${JSON.stringify(
                        result.customClaims
                    )} returning`
                );
                return result.customClaims;
            }
            try {
                const firestore = admin.firestore();
                const userId = result.uid;
                return firestore
                    .collection('users')
                    .doc(userId)
                    .get()
                    .then((userData: any) => {
                        const user = userData.data();
                        admin
                            .auth()
                            .setCustomUserClaims(userId, {
                                participantId: user.participantId,
                                org: user.org
                            })
                            .catch((reason: any) => {
                                console.error(
                                    `setCustomUserClaims Promise Rejection, unable to complete setParticipantId request ${reason}`
                                );
                                return {success: false};
                            })
                            .catch((reason: any) => {
                                console.error(
                                    `Error accessing user document ${result.uid} Promise Rejection, unable to complete setParticipantId request ${reason}`
                                );
                                return {success: false};
                            });
                    })
                    .catch((err: any) => {
                        console.error(err);
                        return {success: false};
                    });
            } catch (e) {
                console.error(
                    `Unable to complete setParticipantId request ${e}`
                );
                return {success: false};
            }
        })
        .catch((reason: any) => {
            console.error(
                `getUserByEmail Promise Rejection, unable to complete setParticipantId request ${reason}`
            );
            return {success: false};
        });
});

exports.setParticipantIdClaim = functions.https.onCall(
    async (data: any, context: any) => {
        if (!context.auth) {
            // Throwing an HttpsError so that the client gets the error details.
            throw new functions.https.HttpsError(
                'failed-precondition',
                'The function must be called ' + 'while authenticated.'
            );
        }
        const email = data.email;

        const firestore = admin.firestore();
        const result = await admin.auth().getUserByEmail(email);
        const userId = result.uid;
        const userData = await firestore.collection('users').doc(userId).get();
        const user = userData.data();
        console.log(`Setting ${email} to have ${user.participantId} on token`);
        admin
            .auth()
            .setCustomUserClaims(userId, {
                participantId: user.participantId,
                org: user.org
            })
            .then((res: void) => {
                data.success = true;
                return data;
            })
            .catch((err: any) => {
                console.error(`Unable to set ParticipantId for ${data.email}`);
                data.success = false;
                return data;
            });
    }
);

exports.checkAdminRole = functions.https.onCall((data: any, context: any) => {
    return admin
        .auth()
        .verifyIdToken(data.token)
        .then(function (decodedToken: any) {
            return {user: decodedToken};
        })
        .catch(function (error: any) {
            console.error('Error fetching user data:', error);
        });
});

exports.getPreviewToken = functions.https.onCall((data: any, context: any) => {
    let userId = envVars.shape_preview.user;
    const token = data.token;
    return admin
        .auth()
        .verifyIdToken(token)
        .then(async (decodedToken: any) => {
            let additionalClaims = {
                preview: true,
                org: decodedToken.org
            };
            const customToken = await admin
                .auth()
                .createCustomToken(userId, additionalClaims);
            return {customToken: customToken, org: decodedToken.org};
        })
        .catch((e: any) => {
            console.error('Error fetching user data:', e);
        });
});

exports.checkUserExists = functions.https.onCall(
    async (data: any, context: any) => {
        try {
            const email = data.email;
            return await admin.auth().getUserByEmail(email);
        } catch (e) {
            return {email: null, uid: null};
        }
    }
);
