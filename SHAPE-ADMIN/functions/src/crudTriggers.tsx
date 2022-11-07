import * as functions from 'firebase-functions';
import { DocumentData, DocumentSnapshot, FieldValue, getFirestore } from 'firebase-admin/firestore';

import RuleFactory from './RuleFactory';
import {
    EHRDocument,
    HistoryLog,
    InformedConsent,
    ParticipantResponse,
    QuestionnaireCompletedJob,
    QuestionnaireQuestion,
    Survey,
    SurveyJoinedJob,
    User
} from './interfaces/DataTypes';
import { Context } from './question/engine/Context';
import _ from 'lodash';
import { isEmptyObject } from './utils/utils';
import { sendEmailNotification, sendNotification } from './utils/sendNotification';
import { removeParticipantsFromQuestionnaire } from './ScheduleTriggers';

export const setupCruds = function (parentExports: any) {
    parentExports.onParticipantResponseWrite = functions.firestore
        .document('participant-response/{responseId}')
        .onWrite(onParticipantResponseWrite);
    parentExports.onSurveyWrite = functions.firestore.document('survey/{surveyId}').onWrite(onSurveyWrite);
    parentExports.onQuestionnaireWrite = functions.firestore
        .document('questionnaire/{questionnaireId}')
        .onWrite(onQuestionnaireWrite);
    parentExports.onInformedConsentWrite = functions.firestore
        .document('informed-consent/{consentId}')
        .onWrite(onInformedConsentWrite);
    parentExports.onEHRWrite = functions.firestore.document('ehr/{ehrId}').onWrite(onEHRWrite);
};

const onEHRWrite = async (change: functions.Change<DocumentSnapshot>, context: functions.EventContext) => {
    const isDeleted = change.before.exists && !change.after.exists;
    const isCreated = !change.before.exists && change.after.exists;
    const isUpdated = change.before.exists && change.after.exists;

    if (isUpdated) {
        console.log('isUpdated');
        await notifyAdminOfEHR(change.after);
    } else if (isCreated) {
        console.log('isCreated');
        await notifyAdminOfEHR(change.after);
    } else if (isDeleted) {
        console.log('isDeleted');
        // May never get used? Logging?
    } else {
        console.error(
            `Shouldn't be possible to get here. before.exists: ${change.before.exists}, after.exists: ${change.after.exists}`
        );
    }
};

const onParticipantResponseWrite = async (
    change: functions.Change<DocumentSnapshot>,
    context: functions.EventContext
) => {
    const isDeleted = change.before.exists && !change.after.exists;
    const isCreated = !change.before.exists && change.after.exists;
    const isUpdated = change.before.exists && change.after.exists;

    if (isUpdated) {
        console.log('isUpdated');
        await addToQuestionnaireRule(change, context);
        await addToQuestionnaireOnResponseComplete(change.after);
    } else if (isCreated) {
        console.log('isCreated');
        await addToQuestionnaireRule(change, context);
        await addToQuestionnaireOnResponseComplete(change.after);
    } else if (isDeleted) {
        console.log('isDeleted');
        // May never get used? Logging?
    } else {
        console.error(
            `Shouldn't be possible to get here. before.exists: ${change.before.exists}, after.exists: ${change.after.exists}`
        );
    }
};

const onSurveyWrite = async (change: functions.Change<DocumentSnapshot>, context: functions.EventContext) => {
    const isDeleted = change.before.exists && !change.after.exists;
    const isCreated = !change.before.exists && change.after.exists;
    const isUpdated = change.before.exists && change.after.exists;

    if (isUpdated) {
        console.log('isUpdated');
        await logParticipantHistory(change, context, 'survey');
        await logSurveyStatus(change, context);
    } else if (isCreated) {
        console.log('isCreated');
        await logParticipantHistory(change, context, 'survey');
        await logSurveyStatus(change, context);
    } else if (isDeleted) {
        console.log('isDeleted');
        await logParticipantHistory(change, context, 'survey');
        await logSurveyStatus(change, context);
        // May never get used? Logging?
    } else {
        console.error(
            `Shouldn't be possible to get here. before.exists: ${change.before.exists}, after.exists: ${change.after.exists}`
        );
    }
};

const onQuestionnaireWrite = async (
    change: functions.Change<DocumentSnapshot>,
    context: functions.EventContext
) => {
    const isDeleted = change.before.exists && !change.after.exists;
    const isCreated = !change.before.exists && change.after.exists;
    const isUpdated = change.before.exists && change.after.exists;

    if (isUpdated) {
        console.log('isUpdated');
        await logParticipantHistory(change, context, 'questionnaire');
        await logQuestionnaireStatus(change, context);
        await onQuestionnaireClosed(change, context);
    } else if (isCreated) {
        console.log('isCreated');
        await logParticipantHistory(change, context, 'questionnaire');
        await logQuestionnaireStatus(change, context);
    } else if (isDeleted) {
        console.log('isDeleted');
        await logParticipantHistory(change, context, 'questionnaire');
        await logQuestionnaireStatus(change, context);
        // May never get used? Logging?
    } else {
        console.error(
            `Shouldn't be possible to get here. before.exists: ${change.before.exists}, after.exists: ${change.after.exists}`
        );
    }
};

const onInformedConsentWrite = async (
    change: functions.Change<DocumentSnapshot>,
    context: functions.EventContext
) => {
    console.log('onInformedConsentWrite()');
    const isCreated = !change.before.exists && change.after.exists;

    if (isCreated) {
        await addToSurveyOnInformedConsent(change.after);
    }
};

const onQuestionnaireClosed = async (
    change: functions.Change<DocumentSnapshot>,
    context: functions.EventContext
) => {
    const lockedBefore = change.before.get('locked');
    const lockedAfter = change.after.get('locked');
    const openBefore = change.before.get('open');
    const openAfter = change.after.get('open');
    const archivedBefore = change.before.get('archived');
    const archivedAfter = change.after.get('archived');
    console.log('lockedBefore', lockedBefore);
    console.log('lockedAfter', lockedAfter);
    console.log('openBefore', openBefore);
    console.log('openAfter', openAfter);
    console.log('archivedBefore', archivedBefore);
    console.log('archivedAfter', archivedAfter);

    if (lockedBefore === lockedAfter && openBefore === openAfter && archivedBefore === archivedAfter) {
        // no change to survey status
        return;
    }

    const becameClosed =
        lockedBefore === true && lockedAfter === true && openBefore === true && openAfter === false;
    if (becameClosed) {
        const participantList = change.after.get('participants');
        await removeParticipantsFromQuestionnaire(participantList, change.after);
    }
};

const addToQuestionnaireRule = async (
    change: functions.Change<DocumentSnapshot>,
    context: functions.EventContext
) => {
    console.log('addToQuestionnaireRule start');
    const participantResponse = change.after.exists ? (change.after.data() as ParticipantResponse) : null;
    if (participantResponse && participantResponse.complete) {
        console.log('participantResponse', participantResponse);
        console.log('questionnaireId', participantResponse.questionnaireId);
        const db = getFirestore();
        const ruleFactory: RuleFactory = new RuleFactory();

        const participantId = participantResponse.participantId;
        const rulesContext: Context = new Context(
            '',
            '',
            '',
            { participantId: participantResponse.participantId, name: '', dob: '', gender: '' },
            '',
            ''
        );
        const questionnaire = await db.doc(`questionnaire/${participantResponse.questionnaireId}`).get();
        const questions: QuestionnaireQuestion[] = questionnaire.get('questions');
        console.log('number of questions', questions.length);
        const questionnaireToAddList: string[] = [];
        questions.forEach((question) => {
            if (question.rules) {
                console.log('question rules', question.rules);
                question.rules.forEach((rule) => {
                    if (rule.addTo) {
                        const currentValue = participantResponse.responses.find(
                            (response) => response.question === question.name
                        );
                        if (currentValue) {
                            const addTo = ruleFactory.evaluateRules(
                                question,
                                currentValue.response,
                                rulesContext
                            );
                            if (addTo) {
                                questionnaireToAddList.push(addTo);
                            }
                        }
                    }
                });
            }
        });
        console.log('participantId', participantId);
        console.log('questionnaireToAddList', questionnaireToAddList);
        if (participantId && questionnaireToAddList.length > 0) {
            console.log('adding to questionnaires');
            // await addParticipantToQuestionnaires(participantId, questionnaireToAddList);
            await addProfileToQuestionnaires(participantResponse, questionnaireToAddList);
        }
    }
};

const addProfileToQuestionnaires = async (
    participantResponse: ParticipantResponse,
    questionnaireList: string[]
) => {
    console.log('addProfileToQuestionnaires start');
    console.log('questionnaireList', questionnaireList);
    const db = getFirestore();
    const { participantId, org, userId, profileId, surveyId } = participantResponse;
    console.log('participantId', participantId);
    console.log('org', org);
    console.log('userId', userId);
    console.log('profileId', profileId);
    console.log('surveyId', surveyId);
    const userRef = await db
        .collection('users')
        .doc(userId)
        .get()
        .catch((error) => console.error(error));
    let user;
    if (userRef && userRef.exists) {
        user = userRef.data() as User;
    } else {
        console.error('no user for', userId);
        return;
    }

    for (const questionnaireToJoinId of questionnaireList) {
        console.log('questionnaireToJoinId', questionnaireToJoinId);
        const questionnaireRef = await db
            .collection('questionnaire')
            .doc(questionnaireToJoinId)
            .get()
            .catch((error) => console.error(error));
        if (!(questionnaireRef && questionnaireRef.exists)) {
            console.log(`questionnaire, ${questionnaireToJoinId}, doesn't exist`);
            continue;
        }
        const participantList: string[] = questionnaireRef.get('participants');
        console.log('participantList', participantList);
        const isParticipantOnQuestionnaire = participantList.includes(participantId);
        console.log('isParticipantOnQuestionnaire', isParticipantOnQuestionnaire);
        if (isParticipantOnQuestionnaire) {
            const responseRef = await db
                .collection('participant-response')
                .where('questionnaireId', '==', questionnaireToJoinId)
                .where('participantId', '==', participantId)
                .where('profileId', '==', profileId)
                .get()
                .catch((error) => console.error(error));
            if (responseRef && !responseRef.empty) {
                const responseType = responseRef.docs[0].get('systemGeneratedType');
                console.log('responseType', responseType);
                if (responseType === 'notApplicable') {
                    await db
                        .collection('participant-response')
                        .doc(responseRef.docs[0].id)
                        .delete()
                        .catch((error) => console.error(error));
                }
            }
        } else {
            const userProfiles = user.profiles.filter((p) => p.id !== profileId);
            console.log('userProfiles', userProfiles);
            for (const userProfile of userProfiles) {
                const responseRef = await db
                    .collection('participant-response')
                    .where('questionnaireId', '==', questionnaireToJoinId)
                    .where('participantId', '==', participantId)
                    .where('profileId', '==', userProfile.id)
                    .get()
                    .catch((error) => console.error(error));
                if (!responseRef || responseRef.empty) {
                    const notApplicableResponse: ParticipantResponse = {
                        participantId,
                        profile: userProfile.name,
                        profileDOB: userProfile.dob,
                        profileId: userProfile.id,
                        org,
                        complete: true,
                        dateWritten: new Date(),
                        questionnaireId: questionnaireToJoinId,
                        responses: [],
                        surveyId,
                        userId,
                        systemGenerated: true,
                        systemGeneratedType: 'notApplicable'
                    };

                    await createProfileResponse(notApplicableResponse);
                }
            }

            await addParticipantToQuestionnaire(participantId, questionnaireToJoinId);
        }
    }
};

const createProfileResponse = async (response: ParticipantResponse) => {
    console.log('createProfileResponse start');
    const db = getFirestore();
    console.log('response.id', response.id);
    if (!response.id) {
        await db
            .collection('participant-response')
            .add(response)
            .catch((error) => console.error(error));
    } else {
        await db
            .collection('participant-response')
            .doc(response.id)
            .update(response)
            .catch((error) => console.error(error));
    }
};

const addParticipantToQuestionnaire = async (participantId: string, questionnaireId: string) => {
    const db = getFirestore();
    await db
        .collection('questionnaire')
        .doc(questionnaireId)
        .update({
            participants: FieldValue.arrayUnion(participantId)
        })
        .catch((error) => console.error(error));
};

const participantLogBuilder = async (
    document: DocumentSnapshot<DocumentData>,
    docType: string,
    actionType: string,
    participant: string
) => {
    const db = getFirestore();

    const org = document.get('org');
    const publicAccess: boolean = document.get('public');

    console.log('docType', docType);
    console.log('actionType', actionType);
    console.log('participant', participant);
    console.log('org', org);
    console.log('publicAccess', publicAccess);

    const log: HistoryLog = {
        actionType: actionType,
        org: org,
        userId: '',
        surveyId: '',
        participantId: '',
        timestamp: new Date()
    };
    if (publicAccess) {
        log.userId = participant;
        log.participantId = participant;
    } else {
        const participantRef = await db
            .collection('participant')
            .where('org', '==', org)
            .where('participantId', '==', participant)
            .get()
            .catch((error) => console.error(error));
        if (participantRef) {
            log.userId = participantRef.docs[0].get('userId') || '';
            log.participantId = participant;
        }
    }
    if (docType === 'survey') {
        log.surveyId = document.id;
    } else if (docType === 'questionnaire') {
        log.surveyId = document.get('surveyId');
        log.questionnaireId = document.id;
    }
    console.log(log);
    return log;
};

const logParticipantHistory = async (
    change: functions.Change<DocumentSnapshot>,
    context: functions.EventContext,
    type: string
) => {
    console.log('logParticipantHistory()');
    console.log('type', type);
    const before = change.before;
    const after = change.after;
    const participantsBefore: string[] = before.exists ? before.get('participants') : [];
    const participantsAfter: string[] = after.exists ? after.get('participants') : [];

    console.log('participantsBefore', participantsBefore);
    console.log('participantsAfter', participantsAfter);

    const participantsRemoved = _.difference(participantsBefore, participantsAfter);
    const participantsAdded = _.difference(participantsAfter, participantsBefore);
    // Case added   ->                          before: ['1111', '2222', '3333']            after: ['1111', '2222', '3333', '4444']
    // Case removed ->                          before: ['1111', '2222', '3333', '4444']    after: ['1111', '2222', '3333']
    // Case Survey/Questionnaire deleted ->     before: ['1111', '2222', '3333', '4444']    after: []
    // Case Survey/Questionnaire created ->     before: []                                  after: ['1111', '2222', '3333', '4444']
    if (isEmptyObject(participantsAdded) && isEmptyObject(participantsRemoved)) {
        // no participant change
        return;
    }

    const db = getFirestore();
    const logs: HistoryLog[] = [];
    console.log('participantsRemoved', participantsRemoved);
    console.log('participantsAdded', participantsAdded);
    if (type === 'survey') {
        for (const participant of participantsRemoved) {
            const log = await participantLogBuilder(after, type, 'respondentRemovedFromSurvey', participant);
            logs.push(log);
        }
        for (const participant of participantsAdded) {
            const log = await participantLogBuilder(after, type, 'respondentAddedToSurvey', participant);
            logs.push(log);
        }
    } else if (type === 'questionnaire') {
        for (const participant of participantsRemoved) {
            const log = await participantLogBuilder(
                after,
                type,
                'respondentRemovedFromQuestionnaire',
                participant
            );
            logs.push(log);
        }
        for (const participant of participantsAdded) {
            const log = await participantLogBuilder(
                after,
                type,
                'respondentAddedToQuestionnaire',
                participant
            );
            logs.push(log);
        }
    }

    console.log('logs', logs);
    if (!isEmptyObject(logs)) {
        for (const log of logs) {
            await db
                .collection('history')
                .add(log)
                .catch((error) => console.error(error));
        }
    }
};

const logSurveyStatus = async (
    change: functions.Change<DocumentSnapshot>,
    context: functions.EventContext
) => {
    console.log('logSurveyStatus()');
    const isDeleted = change.before.exists && !change.after.exists;
    const isCreated = !change.before.exists && change.after.exists;
    const isUpdated = change.before.exists && change.after.exists;

    const log = {
        actionType: 'surveyManualChange',
        org: '',
        surveyId: '',
        timestamp: new Date()
    };

    if (isCreated) {
        log.actionType = 'surveyCreated';
        log.org = change.after.get('org');
        log.surveyId = change.after.id;
    } else if (isUpdated) {
        log.org = change.after.get('org');
        log.surveyId = change.after.id;
        const lockedBefore = change.before.get('locked');
        const lockedAfter = change.after.get('locked');
        const openBefore = change.before.get('open');
        const openAfter = change.after.get('open');
        const archivedBefore = change.before.get('archived');
        const archivedAfter = change.after.get('archived');
        console.log('lockedBefore', lockedBefore);
        console.log('lockedAfter', lockedAfter);
        console.log('openBefore', openBefore);
        console.log('openAfter', openAfter);
        console.log('archivedBefore', archivedBefore);
        console.log('archivedAfter', archivedAfter);

        if (lockedBefore === lockedAfter && openBefore === openAfter && archivedBefore === archivedAfter) {
            // no change to survey status
            return;
        }

        const becameOpen =
            lockedBefore === false && lockedAfter === true && openBefore === false && openAfter === true;
        const becameClosed =
            lockedBefore === true && lockedAfter === true && openBefore === true && openAfter === false;

        if (becameOpen) {
            log.actionType = 'surveyOpened';
        }
        if (becameClosed) {
            log.actionType = 'surveyClosed';
        }
        if (archivedBefore === false && archivedAfter === true) {
            log.actionType = 'surveyArchived';
        }
    } else if (isDeleted) {
        log.actionType = 'surveyDeleted';
        log.org = change.before.get('org');
        log.surveyId = change.before.id;
    } else {
        console.error('logSurveyStatus - reached unreachable else');
        console.error('before and after do not exist');
    }

    const db = getFirestore();
    await db
        .collection('history')
        .add(log)
        .catch((error) => console.error(error));
};
const logQuestionnaireStatus = async (
    change: functions.Change<DocumentSnapshot>,
    context: functions.EventContext
) => {
    console.log('logQuestionnaireStatus()');
    const isDeleted = change.before.exists && !change.after.exists;
    const isCreated = !change.before.exists && change.after.exists;
    const isUpdated = change.before.exists && change.after.exists;

    const log = {
        actionType: 'questionnaireManualChange',
        org: '',
        surveyId: '',
        questionnaireId: '',
        timestamp: new Date()
    };

    if (isCreated) {
        log.actionType = 'questionnaireCreated';
        log.org = change.after.get('org');
        log.surveyId = change.after.get('surveyId');
        log.questionnaireId = change.after.id;
    } else if (isUpdated) {
        log.org = change.after.get('org');
        log.surveyId = change.after.get('surveyId');
        log.questionnaireId = change.after.id;
        const lockedBefore = change.before.get('locked');
        const lockedAfter = change.after.get('locked');
        const openBefore = change.before.get('open');
        const openAfter = change.after.get('open');
        const archivedBefore = change.before.get('archived');
        const archivedAfter = change.after.get('archived');
        console.log('lockedBefore', lockedBefore);
        console.log('lockedAfter', lockedAfter);
        console.log('openBefore', openBefore);
        console.log('openAfter', openAfter);
        console.log('archivedBefore', archivedBefore);
        console.log('archivedAfter', archivedAfter);

        if (lockedBefore === lockedAfter && openBefore === openAfter && archivedBefore === archivedAfter) {
            // no change to survey status
            return;
        }

        const becameOpen =
            lockedBefore === false && lockedAfter === true && openBefore === false && openAfter === true;
        const becameClosed =
            lockedBefore === true && lockedAfter === true && openBefore === true && openAfter === false;

        if (becameOpen) {
            log.actionType = 'questionnaireOpened';
        }
        if (becameClosed) {
            log.actionType = 'questionnaireClosed';
        }
        if (archivedBefore === false && archivedAfter === true) {
            log.actionType = 'questionnaireArchived';
        }
    } else if (isDeleted) {
        log.actionType = 'questionnaireDeleted';
        log.org = change.before.get('org');
        log.surveyId = change.before.get('surveyId');
        log.questionnaireId = change.before.id;
    } else {
        console.error('logQuestionnaireStatus - reached unreachable else');
        console.error('before and after do not exist');
    }

    const db = getFirestore();
    await db
        .collection('history')
        .add(log)
        .catch((error) => console.error(error));
};

const addToSurveyOnInformedConsent = async (document: DocumentSnapshot<DocumentData>) => {
    console.log('addToSurveyOnInformedConsent()');
    const { surveyId, participantId, org } = document.data() as InformedConsent;
    const db = getFirestore();
    const surveyRef = await db
        .collection('survey')
        .doc(surveyId)
        .get()
        .catch((error) => console.error(error));
    if (!surveyRef?.exists) {
        console.error(
            `survey ${surveyId} does not exist but an informed consent for it (${document.id}) does. This is likely a firestore call error.`
        );
        return;
    }
    const survey: Survey = surveyRef.data() as any;
    survey.id = surveyRef.id;

    const job = survey.scheduledJobs?.find(
        (surveyJob) => surveyJob.type === 'onSurveyJoined'
    ) as SurveyJoinedJob;

    if (job) {
        if (job.interval > 0) {
            console.log('job interval is > 0 so no immediate add is necessary');
            return;
        }
        const questionnaireToJoin = await db.collection('questionnaire').doc(job.questionnaireToJoin).get();
        const joinQuestionnaireParticipants: string[] = questionnaireToJoin.get('participants');
        const questionnaireToJoinResponsesDocs = await db
            .collection('participant-response')
            .where('questionnaireId', '==', job.questionnaireToJoin)
            .where('org', '==', org)
            .where('participantId', '==', participantId)
            .where('complete', '==', true)
            .get()
            .catch((error) => console.error(error));
        const questionnaireToJoinResponses = questionnaireToJoinResponsesDocs
            ? questionnaireToJoinResponsesDocs.docs
            : [];

        const isQTJResponseCompleted = questionnaireToJoinResponses[0]?.exists;
        const isParticipantOnQTJ = joinQuestionnaireParticipants.includes(participantId);

        if (!isQTJResponseCompleted && !isParticipantOnQTJ) {
            const result = await db
                .collection('questionnaire')
                .doc(job.questionnaireToJoin)
                .update({
                    participants: FieldValue.arrayUnion(participantId)
                })
                .catch((error) => console.error(error));

            if (result) {
                const notificationSubject = 'New Questionnaire Available';
                const notificationMessage = `You have been added to questionnaire ${questionnaireToJoin.get(
                    'name'
                )} within survey ${
                    survey.name
                }. Please submit a response at your earliest convenience. Thank you.`;
                await sendNotification(
                    [participantId],
                    org,
                    notificationSubject,
                    notificationMessage,
                    !!survey.public
                );
            }
        }
    }
};

const addToQuestionnaireOnResponseComplete = async (document: DocumentSnapshot<DocumentData>) => {
    console.log('addToQuestionnaireOnResponseComplete()');
    const completed = document.get('complete');
    if (!completed) {
        console.log('response is not yet complete');
        return;
    }
    const { surveyId, participantId, org } = document.data() as InformedConsent;
    const db = getFirestore();
    const surveyRef = await db
        .collection('survey')
        .doc(surveyId)
        .get()
        .catch((error) => console.error(error));
    if (!surveyRef?.exists) {
        console.error(
            `survey ${surveyId} does not exist but an informed consent for it (${document.id}) does. This is likely a firestore call error.`
        );
        return;
    }
    const survey: Survey = surveyRef.data() as any;
    survey.id = surveyRef.id;

    const job = survey.scheduledJobs?.find(
        (surveyJob) => surveyJob.enabled && surveyJob.type === 'onQuestionnaireCompleted'
    ) as QuestionnaireCompletedJob;

    if (job) {
        if (job.interval > 0) {
            console.log('job interval is > 0 so no immediate add is necessary');
            return;
        }
        const questionnaireToJoin = await db.collection('questionnaire').doc(job.questionnaireToJoin).get();
        const joinQuestionnaireParticipants: string[] = questionnaireToJoin.get('participants');
        const questionnaireToJoinResponsesDocs = await db
            .collection('participant-response')
            .where('questionnaireId', '==', job.questionnaireToJoin)
            .where('org', '==', org)
            .where('participantId', '==', participantId)
            .where('complete', '==', true)
            .get()
            .catch((error) => console.error(error));
        const questionnaireToJoinResponses = questionnaireToJoinResponsesDocs
            ? questionnaireToJoinResponsesDocs.docs
            : [];

        const isQTJResponseCompleted = questionnaireToJoinResponses[0]?.exists;
        const isParticipantOnQTJ = joinQuestionnaireParticipants.includes(participantId);

        if (!isQTJResponseCompleted && !isParticipantOnQTJ) {
            const result = await db
                .collection('questionnaire')
                .doc(job.questionnaireToJoin)
                .update({
                    participants: FieldValue.arrayUnion(participantId)
                })
                .catch((error) => console.error(error));

            if (result) {
                const notificationSubject = 'New Questionnaire Available';
                const notificationMessage = `You have been added to questionnaire ${questionnaireToJoin.get(
                    'name'
                )} within survey ${
                    survey.name
                }. Please submit a response at your earliest convenience. Thank you.`;
                await sendNotification(
                    [participantId],
                    org,
                    notificationSubject,
                    notificationMessage,
                    !!survey.public
                );
            }
        }
    }
};

const notifyAdminOfEHR = async (document: DocumentSnapshot<DocumentData>) => {
    console.log('notifyAdminOfEHR() start');
    const db = getFirestore();

    const { org } = document.data() as EHRDocument;
    const adminUserRef = await db
        .collection('users')
        .where('orgAdmin', '==', true)
        .where('org', '==', org)
        .get()
        .catch((error) => console.log(error));
    let adminEmail: string | boolean = false;
    let contactName;
    if (adminUserRef && !adminUserRef.empty) {
        adminEmail = adminUserRef.docs[0].get('adminEmail') as string;
        contactName = adminUserRef.docs[0].get('contactName') as string;
    }
    console.log('adminEmail', adminEmail);
    console.log('contactName', contactName);

    const subject = 'EHR Record Created for SHAPE';
    const message = 'An EHR record was created for SHAPE. Please log into SHAPE Admin Portal to view it.';
    if (adminEmail) {
        const mailOptions = {
            from: 'SHAPE Application <noreply@patientexperience.app>',
            replyTo: 'noreply@patientexperience.app',
            to: adminEmail, //email address
            subject: subject, // email subject
            html: `<p>Hello ${contactName},</p><p>${message}</p><p>Sincerely,<br/>The SHAPE team</p>` // email content in HTML
        };

        sendEmailNotification(mailOptions, (error: any) => {
            if (error) {
                return console.error(error.toString());
            }
            console.log(`Email sent to ${adminEmail}`);
        });
    } else {
        console.error('No admin user for ', org);
    }
};
