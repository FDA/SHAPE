import * as functions from 'firebase-functions';
import {
    DocumentData,
    DocumentSnapshot,
    FieldValue,
    Firestore,
    getFirestore,
    QueryDocumentSnapshot
} from 'firebase-admin/firestore';
import { differenceInCalendarDays, format } from 'date-fns';
import {
    DiaryNotWrittenJob,
    DiaryResponse,
    InformedConsent,
    ParticipantResponse,
    QNCJob,
    QuestionnaireCompletedJob,
    ScheduledJob,
    SurveyJoinedJob,
    User
} from './interfaces/DataTypes';
import { getUsersFromParticipantList, sendNotification } from './utils/sendNotification';
import { isEmptyObject } from './utils/utils';

export const setupSchedules = function (parentExports: any) {
    parentExports.scheduledCloudFunction = functions.pubsub
        .schedule('0 15 * * *') // Runs every day at 3 p.m.
        .timeZone('America/New_York')
        .onRun(async (context) => {
            console.log('scheduledCloudFunction: ran at', format(Date.now(), 'P pppp')); // 04/29/1453 12:00:00 AM GMT+02:00
            await runTriggers();
        });
};

const getScheduledJobs = (db: Firestore, collection: string, type: string) => {
    return db
        .collection(collection)
        .orderBy('scheduledJobs')
        .get()
        .then((list) => {
            const results: any[] = [];
            list.forEach((item) => {
                const scheduledJobs: ScheduledJob[] = item.get('scheduledJobs');
                if (scheduledJobs.length > 0) {
                    const filteredJobs = scheduledJobs.filter((job) => job.enabled && job.type === type);
                    results.push(...filteredJobs);
                }
            });
            return results;
        });
};

export const onQuestionnaireCompleted = async () => {
    const db = getFirestore();
    const jobType = 'onQuestionnaireCompleted';
    const scheduledJobs: QuestionnaireCompletedJob[] = await getScheduledJobs(db, 'survey', jobType);

    for (const job of scheduledJobs) {
        // scheduledJobs.forEach(async (job) => {
        console.log(job);
        if (!job.questionnaireCompleted || !job.questionnaireToJoin) {
            console.error(
                `scheduledJob cannot be empty for questionnaireCompleted and questionnaireToJoin for ${jobType}`
            );
        } else {
            console.log('job is good, proceeding');
            const questionnaireToJoin = await db
                .collection('questionnaire')
                .doc(job.questionnaireToJoin)
                .get();
            const survey = await db.collection('survey').doc(job.surveyId).get();
            const participantsOnSurvey: string[] = survey.get('participants');

            // check their responses to see if they've completed the questionnaire
            const participantResponseDocs = await db
                .collection('participant-response')
                .where('questionnaireId', '==', job.questionnaireCompleted)
                .where('complete', '==', true)
                .get()
                .catch((error) => console.error(error));

            const participantResponses = participantResponseDocs ? participantResponseDocs.docs : [];
            const filteredParticipantResponses = participantResponses.filter((participant) =>
                participantsOnSurvey.includes(participant.get('participantId'))
            );
            console.log('Number of participantsToCheck:', participantResponses.length);
            console.log('Number of filteredParticipantsToCheck:', filteredParticipantResponses.length);
            // responses that are for questionnaireCompleted and are actually complete

            // if they have then check to see if they're already on the other questionnaire
            const [participantsToAdd, participantsToRemove] = await participantDurationFilter(
                db,
                job,
                filteredParticipantResponses
            );

            // A list of participants to remove and to be added;

            // Now have a list of participants that have
            //    completed questionnaireCompleted
            //    aren't on questionnaireToJoin
            //    days since date questionnaire was completed is past the job's interval

            // remove from questionnaireToJoin
            console.log('participantsToRemove', participantsToRemove);
            if (participantsToRemove.length) {
                await removeParticipantsFromQuestionnaire(participantsToRemove, questionnaireToJoin);
                const notificationSubject = 'Questionnaire Closed';
                const notificationMessage = `The window to answer questionnaire ${questionnaireToJoin.get(
                    'name'
                )} within survey ${survey.get(
                    'name'
                )} has closed. You will no longer be able to access this questionnaire.`;
                await sendNotification(
                    participantsToRemove,
                    questionnaireToJoin.get('org'),
                    notificationSubject,
                    notificationMessage,
                    !!questionnaireToJoin.get('public')
                );
            }

            console.log('participantsToAdd', participantsToAdd);
            // add participants to questionnaire
            if (participantsToAdd.length) {
                await db
                    .collection('questionnaire')
                    .doc(job.questionnaireToJoin)
                    .update({
                        participants: FieldValue.arrayUnion(...participantsToAdd)
                    })
                    .catch((error) => console.error(error));
                const notificationSubject = 'New Questionnaire Available';
                const notificationMessage = `You have been added to questionnaire ${questionnaireToJoin.get(
                    'name'
                )} within survey ${survey.get(
                    'name'
                )}. Please submit a response at your earliest convenience. Thank you.`;
                await sendNotification(
                    participantsToAdd,
                    questionnaireToJoin.get('org'),
                    notificationSubject,
                    notificationMessage,
                    !!questionnaireToJoin.get('public')
                );
            }
        }
    }
};

export const runTriggers = async () => {
    await onQuestionnaireCompleted().catch((e) => console.error(e));
    await onSurveyJoined().catch((e) => console.error(e));
    await onDiaryNotWritten().catch((e) => console.error(e));
    await onQuestionnaireNotCompleted().catch((e) => console.error(e));
};

export const onSurveyJoined = async () => {
    console.log('Call to onSurveyJoined()');
    const db = getFirestore();
    const jobType = 'onSurveyJoined';
    const jobs: SurveyJoinedJob[] = await getScheduledJobs(db, 'survey', jobType);

    console.log('number of jobs', jobs.length);
    for (const job of jobs) {
        console.log('job', job);
        if (!job.surveyId || !job.questionnaireToJoin) {
            console.error(`scheduledJob cannot be empty for surveyId and questionnaireToJoin for ${jobType}`);
        } else {
            console.log('job is good, proceeding');
            const questionnaireToJoin = await db
                .collection('questionnaire')
                .doc(job.questionnaireToJoin)
                .get();
            const survey = await db.collection('survey').doc(job.surveyId).get();
            const participantsOnSurvey: string[] = survey.get('participants');
            // check informed consent for those after interval
            const participantsToCheckRef = await db
                .collection('informed-consent')
                .where('surveyId', '==', job.surveyId)
                .get()
                .catch((error) => console.error(error));
            const participantsToCheck = participantsToCheckRef ? participantsToCheckRef.docs : [];
            const filteredParticipantsToCheck = participantsToCheck.filter((participant) =>
                participantsOnSurvey.includes(participant.get('participantId'))
            );
            console.log('Number of participantsToCheck:', participantsToCheck.length);
            console.log('Number of filteredParticipantsToCheck:', filteredParticipantsToCheck.length);
            // ensure participants aren't on questionnaireToJoin and are meet duration conditions
            const [participantsToAdd, participantsToRemove] = await participantDurationFilter(
                db,
                job,
                filteredParticipantsToCheck
            );

            // remove from questionnaireToJoin
            console.log('participantsToRemove', participantsToRemove.length);
            if (participantsToRemove.length) {
                await removeParticipantsFromQuestionnaire(participantsToRemove, questionnaireToJoin);
                const notificationSubject = 'Questionnaire Closed';
                const notificationMessage = `The window to answer questionnaire ${questionnaireToJoin.get(
                    'name'
                )} within survey ${survey.get(
                    'name'
                )} has closed. You will no longer be able to access this questionnaire.`;
                await sendNotification(
                    participantsToRemove,
                    questionnaireToJoin.get('org'),
                    notificationSubject,
                    notificationMessage,
                    !!questionnaireToJoin.get('public')
                );
            }

            // add to questionnaireToJoin
            console.log('participantsToAdd', participantsToAdd.length);
            if (participantsToAdd.length) {
                await db
                    .collection('questionnaire')
                    .doc(job.questionnaireToJoin)
                    .update({
                        participants: FieldValue.arrayUnion(...participantsToAdd)
                    })
                    .catch((error) => console.error(error));
                const notificationSubject = 'New Questionnaire Available';
                const notificationMessage = `You have been added to questionnaire ${questionnaireToJoin.get(
                    'name'
                )} within survey ${survey.get(
                    'name'
                )}. Please submit a response at your earliest convenience. Thank you.`;
                await sendNotification(
                    participantsToAdd,
                    questionnaireToJoin.get('org'),
                    notificationSubject,
                    notificationMessage,
                    !!questionnaireToJoin.get('public')
                );
            }
        }
    }
};

export const removeParticipantsFromQuestionnaire = async (
    participantList: string[],
    questionnaire: DocumentSnapshot<DocumentData>
) => {
    const db = getFirestore();
    const org = questionnaire.get('org');
    const publicAccess = questionnaire.get('public');
    const questionnaireId = questionnaire.id;
    console.log('questionnaireId', questionnaireId);
    console.log('public', publicAccess);
    console.log('org', org);

    const userList = await getUsersFromParticipantList(participantList, org, publicAccess);
    for (let c = 0; c < participantList.length; c++) {
        const participant = participantList[c];
        const user = userList[c];
        console.log('participant', participant);
        console.log('user', user);
        if (!user.docId) {
            console.error('no user id');
            continue;
        }

        const systemResponseBoilerplate = {
            systemGenerated: true,
            systemGeneratedType: 'missingInformation',
            complete: true,
            dateWritten: new Date(),
            org: org,
            responses: [],
            questionnaireId: questionnaireId,
            surveyId: questionnaire.get('surveyId'),
            participantId: participant,
            userId: user.docId
        };

        const participantResponseRef = await db
            .collection('participant-response')
            .where('participantId', '==', participant)
            .where('questionnaireId', '==', questionnaireId)
            .get()
            .catch((error) => console.error(error));
        if (!participantResponseRef || participantResponseRef.empty) {
            console.log('no participant-response');
            console.log('Writing response for each profile');

            console.log('profile.length', user.profiles.length);
            for (const profile of user.profiles) {
                console.log(profile);
                const systemResponse: ParticipantResponse = {
                    ...systemResponseBoilerplate,
                    profile: profile.name,
                    profileDOB: profile.dob,
                    profileId: profile.id
                };
                const responseRef = await db
                    .collection('participant-response')
                    .add(systemResponse)
                    .catch((error) => console.error(error));
                console.log('responseRef ID', responseRef?.id);
            }
        } else {
            const responseProfileList = [];
            for (const responseRef of participantResponseRef.docs) {
                const response = responseRef.data() as ParticipantResponse;
                responseProfileList.push(response.profileId);
                if (!response.complete) {
                    response.complete = true;
                    response.systemGenerated = true;
                    response.systemGeneratedType = 'missingInformation';
                    response.systemCompleted = true;
                    await db
                        .collection('participant-response')
                        .doc(responseRef.id)
                        .update(response)
                        .catch((error) => console.error(error));
                    console.log(`response ${responseRef.id} was updated`);
                }
            }
            console.log('user.profiles.length', user.profiles.length);
            console.log('responseProfileList.length', responseProfileList.length);
            for (const profile of user.profiles) {
                console.log('profile already has response', responseProfileList.includes(profile.id));
                if (responseProfileList.includes(profile.id)) {
                    console.log(`profile for ${profile.id} already has a response`);
                    continue;
                }
                const systemResponse: ParticipantResponse = {
                    ...systemResponseBoilerplate,
                    profile: profile.name,
                    profileDOB: profile.dob,
                    profileId: profile.id
                };
                const responseRef = await db
                    .collection('participant-response')
                    .add(systemResponse)
                    .catch((error) => console.error(error));
                console.log('responseRef ID', responseRef?.id);
            }
        }
    }
};

const participantDurationFilter = async (
    db: Firestore,
    job: any,
    participantsToCheck: QueryDocumentSnapshot<DocumentData>[]
) => {
    console.log('participantDurationFilter start');
    const questionnaireToJoin = await db.collection('questionnaire').doc(job.questionnaireToJoin).get();
    const joinQuestionnaireParticipants: string[] = questionnaireToJoin.get('participants');

    const participantsToAddResponses: QueryDocumentSnapshot<DocumentData>[] = [];
    const participantsToRemoveResponses: QueryDocumentSnapshot<DocumentData>[] = [];

    const questionnaireToJoinResponsesDocs = await db
        .collection('participant-response')
        .where('questionnaireId', '==', job.questionnaireToJoin)
        .where('complete', '==', true)
        .get()
        .catch((error) => console.error(error));
    const questionnaireToJoinResponses = questionnaireToJoinResponsesDocs
        ? questionnaireToJoinResponsesDocs.docs
        : [];

    for (const response of participantsToCheck) {
        console.log('response.data()', response.data());
        const userRef = await db
            .collection('users')
            .doc(response.get('userId'))
            .get()
            .catch((error) => console.error(error));
        let user;
        console.log('userRef.exists', userRef?.exists);
        if (userRef && userRef.exists) {
            user = userRef.data() as User;
            user.docId = userRef.id;
        } else {
            console.error('user is undefined');
            continue;
        }
        if (user.orgAdmin || !user.profiles) {
            console.error('user does not have profiles or is a admin');
            continue;
        }
        //get onCompletedQuestionnaire response date
        let questionnaireCompletedDate: any;
        if (job.type === 'onSurveyJoined') {
            questionnaireCompletedDate = response.get('dateAgreed'); // informed consent date
        } else {
            questionnaireCompletedDate = response.get('dateWritten'); // participant response date
        }
        console.log(questionnaireCompletedDate);
        const qtjResponseProfiles = questionnaireToJoinResponses
            .filter((qtjResponse) => response.get('participantId') === qtjResponse.get('participantId'))
            .map((qtjResponse) => qtjResponse.get('profileId') as string);

        console.log('user.profiles', user.profiles);
        console.log('qtjParticipantProfiles', qtjResponseProfiles);
        const profilesUnanswered = user.profiles.filter(
            (profile) => !qtjResponseProfiles.includes(profile.id)
        );
        console.log('profilesUnanswered', profilesUnanswered);
        const cqDayDifference = differenceInCalendarDays(Date.now(), questionnaireCompletedDate.toMillis());
        const duration = job.duration; // < 0, never remove; == 0, removed upon questionnaireToJoin completed; > 0, remove after duration
        const interval = job.interval;
        const maxTime = interval + duration;
        const isQTJResponseCompleted = !profilesUnanswered.length; // if array of values == false if none == true
        const isParticipantOnQTJ = joinQuestionnaireParticipants.includes(response.get('participantId'));

        console.log('cqDayDifference', cqDayDifference);
        console.log('duration', duration);
        console.log('interval', interval);
        console.log('maxTime', maxTime);
        console.log('isQTJResponseCompleted', isQTJResponseCompleted);
        console.log('isParticipantOnQTJ', isParticipantOnQTJ);
        if (isParticipantOnQTJ) {
            if (!isQTJResponseCompleted && duration > 0) {
                // remove after duration
                if (cqDayDifference >= maxTime) {
                    participantsToRemoveResponses.push(response);
                }
            }
        } else {
            // if participant isn't on questionnaireToJoin
            // what if it isn't complete?
            if (!isQTJResponseCompleted) {
                if (duration > 0) {
                    if (cqDayDifference >= interval && cqDayDifference <= maxTime) {
                        participantsToAddResponses.push(response);
                    }
                } else {
                    participantsToAddResponses.push(response);
                }
            }
        }
    }
    const participantsToAdd: string[] = participantsToAddResponses.map((response) =>
        response.get('participantId')
    );
    const participantsToRemove: string[] = participantsToRemoveResponses.map((response) =>
        response.get('participantId')
    );

    return [participantsToAdd, participantsToRemove];
};

export const onDiaryNotWritten = async () => {
    console.log('onDiaryNotWrittenStart');
    const db = getFirestore();
    const jobType = 'onDiaryNotWritten';
    const scheduledJobs: DiaryNotWrittenJob[] = await getScheduledJobs(db, 'survey', jobType);

    for (const job of scheduledJobs) {
        console.log('job', job);

        const surveyRef = await db
            .collection('survey')
            .doc(job.surveyId)
            .get()
            .catch((error) => {
                console.error(error);
            });
        if (!surveyRef) {
            console.log('surveyRef does not exist. Aborting job.');
            break;
        }
        const participants: string[] = surveyRef.get('participants');
        const org: string = surveyRef.get('org');
        const surveyName: string = surveyRef.get('name');
        const publicAccess: boolean = surveyRef.get('public');
        const lastDiaries: DiaryResponse[] = [];
        const informedConsentList: InformedConsent[] = [];

        console.log('participants', participants);
        console.log('org', org);
        console.log('surveyName', surveyName);
        console.log('publicAccess', publicAccess);

        for (const participant of participants) {
            console.log('participant', participant);
            const lastDiaryRefs = await db
                .collection('participant-diary')
                .where('org', '==', org)
                .where('participantId', '==', participant)
                .where('surveyId', '==', job.surveyId)
                .orderBy('dateWritten')
                .limitToLast(1)
                .get()
                .catch((error) => {
                    console.error(error);
                });
            console.log('lastDiaryRefs.size', lastDiaryRefs?.size);

            if (lastDiaryRefs && lastDiaryRefs.size > 0) {
                const lastDiary: DiaryResponse = lastDiaryRefs.docs[0].data() as any;
                lastDiaries.push(lastDiary);
            } else {
                console.error('lastDiaryRef was void or empty');
            }

            const surveyConsentRef = await db
                .collection('informed-consent')
                .where('surveyId', '==', job.surveyId)
                .where('participantId', '==', participant)
                .get()
                .catch((error) => {
                    console.error(error);
                });
            if (surveyConsentRef && surveyConsentRef.size > 0) {
                const surveyConsent: InformedConsent = surveyConsentRef.docs[0].data() as any;
                informedConsentList.push(surveyConsent);
            } else {
                console.error('lastDiaryRef was void or empty');
            }
        }
        console.log('lastDiaries', lastDiaries);

        const filteredParticipantList = participants.filter((participant) => {
            const diaryEntry = lastDiaries.find((diary) => diary.participantId === participant);
            const informedConsent = informedConsentList.find((ic) => ic.participantId === participant);
            if (diaryEntry) {
                if (diaryEntry.formType.toLowerCase() !== 'withdrawal') {
                    const dateWritten = new Date(diaryEntry.dateWritten);
                    const dayDifference = differenceInCalendarDays(Date.now(), dateWritten.getTime());
                    console.log('diary dateWritten', dateWritten);
                    console.log('dayDifference', dayDifference);
                    console.log('job.interval', job.interval);
                    console.log('job.frequency', job.frequency);

                    if (dayDifference === job.interval) {
                        return true;
                    } else if (dayDifference > job.interval) {
                        const intervalCheck = (dayDifference - job.interval) % job.frequency;
                        console.log('intervalCheck', intervalCheck);

                        if (!isNaN(intervalCheck) && intervalCheck === 0) {
                            return true;
                        }
                    }
                }
            } else {
                if (informedConsent) {
                    console.log('informed consent Date', informedConsent.dateAgreed.toDate());
                    const dayDifference = differenceInCalendarDays(
                        Date.now(),
                        informedConsent.dateAgreed.toMillis()
                    );
                    console.log('dayDifference', dayDifference);
                    console.log('job.interval', job.interval);
                    console.log('job.frequency', job.frequency);

                    if (dayDifference === job.interval) {
                        return true;
                    } else if (dayDifference > job.interval) {
                        const intervalCheck = (dayDifference - job.interval) % job.frequency;
                        console.log('intervalCheck', intervalCheck);

                        if (!isNaN(intervalCheck) && intervalCheck === 0) {
                            return true;
                        }
                    }
                }
            }
            return false;
        });

        console.log('filteredParticipantList', filteredParticipantList);

        if (!isEmptyObject(filteredParticipantList)) {
            const notificationSubject = `Reminder — Create a Self-Report`;
            const defaultMessage = `A self-report has not been created in the past ${job.interval} days for the survey ${surveyName}. Consistently submitting self-reports help improve the accuracy of the study. Please consider creating one at your earliest convenience.`;
            const notificationMessage = job.message || defaultMessage;
            await sendNotification(
                filteredParticipantList,
                org,
                notificationSubject,
                notificationMessage,
                publicAccess
            );
        }
    }
};

export const onQuestionnaireNotCompleted = async () => {
    console.log('onQuestionnaireNotCompleted');
    const db = getFirestore();
    const jobType = 'onQuestionnaireNotCompleted';
    const scheduledJobs: QNCJob[] = await getScheduledJobs(db, 'survey', jobType);

    for (const job of scheduledJobs) {
        console.log('job', job);
        const questionnaireRef = await db
            .collection('questionnaire')
            .doc(job.questionnaireNotCompleted)
            .get()
            .catch((error) => console.error(error));
        if (!questionnaireRef) return;
        const questionnaireOpened = questionnaireRef.get('open');
        if (!questionnaireOpened) {
            console.error(`questionnaire ${job.questionnaireNotCompleted} has not been opened yet`);
            continue;
        }
        let questionnaireOpenedDate: Date;
        const questionnaireHistoryRef = await db
            .collection('history')
            .where('actionType', '==', 'questionnaireOpened')
            .where('questionnaireId', '==', job.questionnaireNotCompleted)
            .get()
            .catch((error) => console.error(error));
        if (questionnaireHistoryRef && !questionnaireHistoryRef.empty) {
            questionnaireOpenedDate = questionnaireHistoryRef.docs[0].get('timestamp').toDate();
        } else {
            console.log(
                `questionnaire ${job.questionnaireNotCompleted} has no history document for opened but questionnaire has opened flag == true`
            );
            continue; // There is no history doc so it hasn't been opened yet. Need date off history record.
        }

        const surveyRef = await db.collection('survey').doc(job.surveyId).get();
        const participantsOnSurvey = surveyRef.get('participants');
        const participantList: string[] = questionnaireRef
            .get('participants')
            .filter((participant: string) => participantsOnSurvey.includes(participant));
        const notificationList: string[] = [];

        for (const participant of participantList) {
            console.log('participant', participant);
            const participantResponseRef = await db
                .collection('participant-response')
                .where('org', '==', questionnaireRef.get('org'))
                .where('participantId', '==', participant)
                .where('questionnaireId', '==', job.questionnaireNotCompleted)
                .get()
                .catch((error) => console.error(error));
            if (
                participantResponseRef &&
                !participantResponseRef.empty &&
                participantResponseRef.docs[0].get('complete')
            ) {
                console.log('response is complete');
            } else {
                let participantResponseDate = undefined;
                if (participantResponseRef && !participantResponseRef.empty) {
                    participantResponseDate = participantResponseRef.docs[0]
                        .get('dateWritten')
                        .toDate() as Date;
                }

                let participantAddDate: Date;
                const participantHistoryRef = await db
                    .collection('history')
                    .where('actionType', '==', 'respondentAddedToQuestionnaire')
                    .where('questionnaireId', '==', job.questionnaireNotCompleted)
                    .where('participantId', '==', participant)
                    .where('org', '==', questionnaireRef.get('org'))
                    .get()
                    .catch((error) => console.error(error));
                if (participantHistoryRef && !participantHistoryRef.empty) {
                    console.log('participantHistoryRef.size', participantHistoryRef.size);
                    if (participantHistoryRef.size > 1) {
                        const lastAddHistory = [...participantHistoryRef.docs].sort(
                            (a, b) => b.get('timestamp').toMillis() - a.get('timestamp').toMillis()
                        );
                        participantAddDate = lastAddHistory[0].get('timestamp').toDate();
                    } else {
                        participantAddDate = participantHistoryRef.docs[0].get('timestamp').toDate();
                    }
                } else {
                    console.log(`participant ${participant} has not been added to questionnaire yet`);
                    continue; // There is no history doc so it hasn't been added yet. Should not be possible since the participant list came from the questionnaire.
                }

                let dateForNotification: Date;
                console.log('participantResponseDate', participantResponseDate);
                console.log('participantAddDate', participantAddDate);
                console.log('questionnaireOpenedDate', questionnaireOpenedDate);
                if (participantAddDate > questionnaireOpenedDate) {
                    dateForNotification = participantAddDate;
                } else {
                    dateForNotification = questionnaireOpenedDate;
                }
                if (participantResponseDate) {
                    if (participantResponseDate > dateForNotification) {
                        dateForNotification = participantResponseDate;
                    }
                }
                console.log('dateForNotification', dateForNotification);
                const dayDifference = differenceInCalendarDays(Date.now(), dateForNotification);
                console.log('dayDifference', dayDifference);
                console.log('job.interval', job.interval);
                console.log('job.frequency', job.frequency);
                if (dayDifference === job.interval) {
                    notificationList.push(participant);
                } else if (dayDifference > job.interval) {
                    const intervalCheck = (dayDifference - job.interval) % job.frequency;
                    console.log('intervalCheck', intervalCheck);
                    if (!isNaN(intervalCheck) && intervalCheck === 0) {
                        notificationList.push(participant);
                    }
                }
            }
        }
        console.log('notificationList', notificationList);
        if (notificationList.length) {
            const notificationSubject = 'Reminder — Answer Questionnaire';
            const defaultMessage = `Questionnaire ${questionnaireRef.get('name')} for survey ${surveyRef.get(
                'name'
            )} has not been submitted. Please complete the questionnaire at your earliest convenience. Thank you.`;
            const notificationMessage = job.message || defaultMessage;
            await sendNotification(
                notificationList,
                questionnaireRef.get('org'),
                notificationSubject,
                notificationMessage,
                !!questionnaireRef.get('public')
            );
        }
    }
};
