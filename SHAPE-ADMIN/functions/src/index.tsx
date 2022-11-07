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
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import {
    onDiaryNotWritten,
    onSurveyJoined,
    onQuestionnaireCompleted,
    runTriggers,
    setupSchedules,
    onQuestionnaireNotCompleted
} from './ScheduleTriggers';
import { setupCruds } from './crudTriggers';
import { sendAppNotification, sendEmailNotification, sendTextNotification } from './utils/sendNotification';

const cors = require('cors')({ origin: true });

const envVars = functions.config();

initializeApp();

exports.getEnvVar = functions.https.onCall((data: any, context: any) => {
    try {
        return functions.config();
    } catch (error) {
        console.error(error);
        return error;
    }
});

exports.getUser = functions.https.onCall((data: any, context: any) => {
    return getAuth()
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
    const uid = data.uid;
    return getAuth()
        .updateUser(uid, {
            disabled: true
        })
        .then(function (userRecord: any) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully disabled user:', userRecord.toJSON());
            getAuth()
                .revokeRefreshTokens(uid)
                .then(() => {
                    return getAuth().getUser(uid);
                })
                .then((usrRecord: any) => {
                    return new Date(usrRecord.tokensValidAfterTime).getTime() / 1000;
                })
                .then((timestamp: any) => {
                    console.log('Tokens revoked at: ', timestamp);
                    return userRecord.toJSON();
                })
                .catch(function (error: any) {
                    console.log('Error disabling user in getAuth()', error);
                });
        })
        .catch(function (error: any) {
            console.log('Error fetching user data:', error);
        });
});

exports.enableUser = functions.https.onCall((data: any, context: any) => {
    return getAuth()
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

exports.sendEmailNotification = functions.https.onCall((data: any, context: any) => {
    // Since this code will be running in the Cloud Functions environment
    // we call initialize Firestore without any arguments because it
    // detects authentication from the environment.
    const { emailRecipients, subject, message } = data;

    try {
        for (const r in emailRecipients) {
            const mailOptions = {
                from: 'SHAPE Application <noreply@patientexperience.app>',
                replyTo: 'noreply@patientexperience.app',
                to: emailRecipients[r].userName, //email address
                subject: subject, // email subject
                html: `<p style="font-size: 16px;"></p> ${message}
                <br />` // email content in HTML
            };
            sendEmailNotification(mailOptions, (error: any) => {
                if (error) {
                    console.log(error.toString());
                }
                console.log(`Email sent to ${emailRecipients[r].userName}`);
            });
        }
    } catch (error) {
        console.error(error);
    }
});

exports.sendMail = functions.https.onRequest((req: any, res: any) => {
    cors(req, res, () => {
        // Since this code will be running in the Cloud Functions environment
        // we call initialize Firestore without any arguments because it
        // detects authentication from the environment.
        // getting dest email by query string
        const recipient = req.body.recipient;
        const surveyId = req.body.surveyId;
        console.log(`Recieved parameters ${recipient} and ${surveyId}`);
        getFirestore()
            .collection('survey')
            .doc(surveyId)
            .get()
            .then((doc: any) => {
                const survey = doc.data();
                console.log(`Inside Snapshot got ${survey}`);
                const { informedConsent, name } = survey;
                const mailOptions = {
                    from: 'SHAPE Application <noreply@patientexperience.app>',
                    replyTo: 'noreply@patientexperience.app',
                    to: recipient,
                    subject: `Informed Consent for Survey: ${name}`, // email subject
                    html: `<p style="font-size: 16px;"></p> ${informedConsent}
                <br />` // email content in HTML
                };
                // returning result
                return sendEmailNotification(mailOptions, (erro: any) => {
                    if (erro) {
                        return res.send(erro.toString());
                    }
                    return res.send(`Informed Consent email sent to ${recipient} for ${name}`);
                });
            })
            .catch((err: any) => {
                console.error(err);
            });
    });
});

exports.createCustomToken = functions.https.onRequest(async (req: any, res: any) => {
    const userId = envVars.shape_preview.user;
    const additionalClaims = {
        admin: true
    };
    cors(req, res, async () => {
        try {
            const customToken = await getAuth().createCustomToken(userId, additionalClaims);
            res.send(customToken);
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }
    });
});

exports.sendSms = functions.https.onRequest((req: any, res: any) => {
    cors(req, res, async () => {
        try {
            const subject = req.body.subject;
            const message = req.body.message;
            const msg = `\n\n${subject} - \n${message}`;
            const phoneNumbers = req.body.phoneNumbers;
            const smsPromises = phoneNumbers.map((num: any) => {
                return sendTextNotification(num, msg);
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

exports.sendNotification = functions.https.onRequest(async (req: any, res: any) => {
    cors(req, res, async () => {
        const message = req.body.message;
        sendAppNotification(message)
            .then((response: any) => {
                console.log(response.successCount + ' messages were sent successfully');
            })
            .catch((error: any) => {
                console.error('Error sending message:', error);
                res.sendStatus(500);
            });
    });
});

exports.createNotificationKey = functions.https.onRequest(async (req: any, res: any) => {
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
});

exports.addDeviceToNotificationKey = functions.https.onRequest(async (req: any, res: any) => {
    cors(req, res, async () => {
        const userId = req.body.userId;
        const deviceId = req.body.deviceId;
        const notificationKey = req.body.notificationKey;

        _firebaseNotificationKeyRequest('add', userId, [deviceId], notificationKey)
            .then((r) => {
                res.sendStatus(200);
            })
            .catch((e) => {
                console.error(e);
            });
    });
});

exports.removeDeviceFromNotificationKey = functions.https.onRequest(async (req: any, res: any) => {
    cors(req, res, async () => {
        const userId = req.body.userId;
        const deviceId = req.body.deviceId;
        const notificationKey = req.body.notificationKey;

        _firebaseNotificationKeyRequest('remove', userId, [deviceId], notificationKey)
            .then((r) => {
                res.sendStatus(200);
            })
            .catch((e) => {
                console.error(e);
            });
    });
});

const _firebaseNotificationKeyRequest = (
    operation: 'create' | 'add' | 'remove',
    notificationKeyName: string,
    registrationIds: string[],
    notificationKey?: string
) => {
    return new Promise((resolve, reject) => {
        const data = {
            operation: operation,
            notification_key_name: notificationKeyName,
            registration_ids: registrationIds,
            notification_key: notificationKey
        };
        if (!notificationKey) {
            delete data.notification_key;
        }
        const options = {
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
            if (body.error) reject(body.error);
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
exports.getNewAuthCode = functions.https.onRequest(async (req: any, res: any) => {
    cors(req, res, async () => {
        getNewAuthCode(req, res);
    });
});
exports.getBearerToken = functions.https.onRequest(async (req: any, res: any) => {
    cors(req, res, async () => {
        getBearerToken(req, res);
    });
});
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
exports.getPatientEHR = functions.https.onRequest(async (req: any, res: any) => {
    cors(req, res, async () => {
        getPatientEHR(req, res)
            .then(() => console.log('getPatientEHR Done.'))
            .catch((err) => {
                console.error(`Error on getPatientEHR ${err}`);
            });
    });
});

exports.setAdmin = functions.https.onCall((data: any, context: any) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called while authenticated.'
        );
    }
    const email = data.email;
    const org = data.org ? data.org : 'ALL';
    console.log(`Setting Admin flag in setAdmin for ${email} on org: ${org}`);
    return getAuth()
        .getUserByEmail(email)
        .then((result: any) => {
            return getAuth()
                .setCustomUserClaims(result.uid, { admin: true, org: org })
                .then(() => {
                    console.log(`Successfully setAdmin for userId ${result.uid}, returning true`);
                    return { success: true };
                })
                .catch((err: any) => {
                    console.error(
                        `Unable to set Admin custom claims for ${email} for org ${org}, returning false`
                    );
                    return { success: false };
                });
        })
        .catch((err: any) => {
            console.error(`Unable to find user by email ${email}, returning false`);
            return { success: false };
        });
});

exports.getCustomClaims = functions.https.onCall((data: any, context: any) => {
    return getAuth()
        .getUserByEmail(data.email)
        .then((res: any) => {
            if (res.customClaims) {
                return res.customClaims;
            } else {
                console.log(`failed to getCustomClaims for ${data.email}`);
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
            'The function must be called while authenticated.'
        );
    }
    const email = data.email;
    return getAuth()
        .getUserByEmail(email)
        .then((result: any) => {
            if (result.customClaims && result.customClaims.participantId) {
                console.log(`result.uid already has claims ${JSON.stringify(result.customClaims)} returning`);
                return result.customClaims;
            }
            try {
                const userId = result.uid;
                return getFirestore()
                    .collection('users')
                    .doc(userId)
                    .get()
                    .then((userData: any) => {
                        const user = userData.data();
                        getAuth()
                            .setCustomUserClaims(userId, {
                                participantId: user.participantId,
                                org: user.org
                            })
                            .then((res: void) => {
                                return { success: true };
                            })
                            .catch((reason: any) => {
                                console.error(
                                    `setCustomUserClaims Promise Rejection, unable to complete setParticipantId request ${reason}`
                                );
                                return { success: false };
                            });
                    })
                    .catch((err: any) => {
                        console.error(err);
                        return { success: false };
                    });
            } catch (e) {
                console.error(`Unable to complete setParticipantId request ${e}`);
                return { success: false };
            }
        })
        .catch((reason: any) => {
            console.error(
                `getUserByEmail Promise Rejection, unable to complete setParticipantId request ${reason}`
            );
            return { success: false };
        });
});

exports.setParticipantIdClaim = functions.https.onCall(async (data: any, context: any) => {
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called while authenticated.'
        );
    }
    const result = await getAuth().getUserByEmail(data.email);
    const userData = await getFirestore().collection('users').doc(result.uid).get();
    const user = userData.data();
    if (user) {
        console.log(`Setting ${data.email} to have ${user.participantId} on token`);
        getAuth()
            .setCustomUserClaims(result.uid, {
                participantId: user.participantId,
                org: user.org
            })
            .then((res: void) => {
                data.success = true;
                return data;
            })
            .catch((err: any) => {
                console.error(`Unable to set ParticipantId for ${data.email}`, err);
                data.success = false;
                return data;
            });
    } else {
        console.error(`Unable to set ParticipantId for ${data.email}. User not found`);
        data.success = false;
        return data;
    }
});

exports.checkAdminRole = functions.https.onCall((data: any, context: any) => {
    return getAuth()
        .verifyIdToken(data.token)
        .then(function (decodedToken: any) {
            return { user: decodedToken };
        })
        .catch(function (error: any) {
            console.error('Error fetching user data:', error);
        });
});

exports.getPreviewToken = functions.https.onCall((data: any, context: any) => {
    const userId = envVars.shape_preview.user;
    const token = data.token;
    return getAuth()
        .verifyIdToken(token)
        .then(async (decodedToken: any) => {
            const additionalClaims = {
                preview: true,
                org: decodedToken.org
            };
            const customToken = await getAuth().createCustomToken(userId, additionalClaims);
            return { customToken: customToken, org: decodedToken.org };
        })
        .catch((e: any) => {
            console.error('Error fetching user data:', e);
        });
});

exports.checkUserExists = functions.https.onCall((data: any, context: any) => {
    getAuth()
        .getUserByEmail(data.email)
        .then((userRecord: any) => {
            return userRecord.toJSON();
        })
        .catch((error: any) => {
            return { email: null, uid: null };
        });
});

exports.triggerCloudFunction = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method === 'POST') {
            const triggerType = req.body.triggerType;
            switch (triggerType) {
                case 'onDiaryNotWritten':
                    await onDiaryNotWritten();
                    res.sendStatus(200);
                    break;
                case 'onQuestionnaireCompleted':
                    await onQuestionnaireCompleted();
                    res.sendStatus(200);
                    break;
                case 'onQuestionnaireNotCompleted':
                    await onQuestionnaireNotCompleted();
                    res.sendStatus(200);
                    break;
                case 'onSurveyJoined':
                    await onSurveyJoined();
                    res.sendStatus(200);
                    break;
                case 'all':
                case 'All':
                case 'ALL':
                    await runTriggers();
                    res.sendStatus(200);
                    break;
                default:
                    res.status(400).send('No such function');
                    break;
            }
        } else {
            res.sendStatus(405);
        }
    });
});

setupSchedules(exports);
setupCruds(exports);
