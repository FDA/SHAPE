import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {responsesToFhir} from '../factory/fhir/fhirQuestionnaireMapping';
import {diaryToFhir} from '../factory/fhir/fhirDiaryMapping';
import { CallbackFunction, ResponseData } from "../interfaces/components";

admin.initializeApp(functions.config().firebase, 'export');

export class ExportService {
    db = admin.firestore();

    firestoreCollection(collectionName: string): FirebaseFirestore.Query<FirebaseFirestore.DocumentData> {
        return this.db.collection(collectionName);
    }

    complexQuery(collection:string, query: any, org: string) {
        let request = this.firestoreCollection(collection);

        for (const q of query) {
            request = request.where(q.key, q.operator, q.value);
        }
        if (org !== "ALL") {
            request = request.where("org", "==", org)
        }
        return request.get().then((responseSnapshot: any) => {
            const responses: ResponseData[] = [];
            responseSnapshot.forEach((doc: { id: string; data: () => any }) => {
                const data = doc.data();
                data.id = doc.id;
                if(data.dateWritten._seconds) {
                    data.dateWritten = new Date(
                        data.dateWritten._seconds * 1000 +
                            data.dateWritten._nanoseconds / 1000000
                    );
                }
                responses.push(data);
            });
            return(responses);
        }).catch((error) => {
            console.error("caught in complex query: " + error);
            return(error);
        })
    }

    getQuestionnaire(org:string, questionnaireId:string) {
        if(org === "ALL") {
            return this.db.collection("questionnaire").doc(questionnaireId).get().then((questionnaire) => {
                if (!questionnaire.exists) {
                    console.log(`*** Request for ${questionnaireId} not found returned: ${JSON.stringify(questionnaire)} `);
                    return {};
                } else {
                    return {id: questionnaire.id, data: questionnaire.data()};
                }
            })
        } else {
            return this.db.collection("questionnaire").doc(questionnaireId).get().then((questionnaire) => {
                if (!questionnaire.exists) {
                    console.error(`*** Request for ${questionnaireId} not found returned: ${JSON.stringify(questionnaire)} `);
                    return {};
                } else {
                    const q = questionnaire.data();
                    if(q!.org === org) {
                        return {id: questionnaire.id, data: questionnaire.data()};
                    } else {
                        console.error("Not Permitted");
                        return {};
                    }
                }
            })
        }
    }

    getSurvey(org:string, surveyId:string) {
        if(org === "ALL") {
            return this.db.collection("survey").doc(surveyId).get().then((survey) => {
                if (!survey.exists) {
                    console.log(`*** Request for ${surveyId} not found returned: ${JSON.stringify(survey)} `);
                    return {};
                } else {
                    return {id: survey.id, data: survey.data()};
                }
            })
        } else {
            return this.db.collection("survey").doc(surveyId).get().then((survey) => {
                if (!survey.exists) {
                    console.error(`*** Request for ${surveyId} not found returned: ${JSON.stringify(survey)} `);
                    return {};
                } else {
                    const s = survey.data();
                    if(s!.org === org) {
                        return {id: survey.id, data: survey.data()};
                    } else {
                        console.error("Not Permitted");
                        return {};
                    }
                }
            })
        }
    }

    public exportDiary(query: any, org: string, callback: CallbackFunction) {
        const surveyId = query.filter((item: any) => {
            return item.key === "surveyId"
        })[0].value;
        this.complexQuery("participant-diary", query, org)
            .then((res) => {
                this.getSurvey(org, surveyId)
                    .then((data: any) => {
                        const id = data.id;
                        const survey = data.data; 
                        const formattedResponse = {
                            surveyId: id,
                            surveyName: survey.name,
                            diaries: res
                        };
                        callback(false, formattedResponse);
                    })
                    .catch((error) => {
                        callback(true, error);
                    })
            })
            .catch((error) => {
                callback(true, error);
            })
        
    }

    public exportQuestionnaire(query: any, org: string, callback: CallbackFunction) {

        const questionnaireId = query.filter((item: any) => {
            return item.key === "questionnaireId"
        })[0].value;
        this.complexQuery("participant-response", query, org)
            .then((responses) => {
                this.getQuestionnaire(org, questionnaireId)
                    .then((data: any) => {
                        const id = data.id;
                        const questionnaire = data.data; 
                        const formattedResponse = {
                            surveyId: questionnaire.surveyId,
                            questionnaireId: id,
                            questionnaireName: questionnaire.name,
                            participantResponses: {
                                questionnaireId: id,
                                allResponses: responses,
                            },
                            questions: questionnaire.questions
                        };
                        callback(false, formattedResponse);
                    })
                    .catch((error) => {
                        callback(true, error);
                    })
            })
            .catch((error) => {
                callback(true, error);
            })        
    }


    public exportDiaryFhir(query: any, org: string, callback: CallbackFunction) {
        const surveyId = query.filter((item: any) => {
            return item.key === "surveyId"
        })[0].value;
        this.complexQuery("participant-diary", query, org)
            .then((responses) => {
                this.getSurvey(org, surveyId)
                    .then((data: any) => {
                        const survey = data.data; 
                        survey.id = data.id;
                        const formattedResponse = diaryToFhir(responses, survey);
                        callback(false, formattedResponse);
                    })
                    .catch((error) => {
                        callback(true, error);
                    })
            })
            .catch((error) => {
                callback(true, error);
            })
        
    }

    public exportQuestionnaireFhir(query: any, org: string, callback: CallbackFunction) {

        const questionnaireId = query.filter((item: any) => {
            return item.key === "questionnaireId"
        })[0].value;
        this.complexQuery("participant-response", query, org)
            .then((responses) => {
                this.getQuestionnaire(org, questionnaireId)
                    .then((data: any) => {
                        const questionnaire = data.data; 
                        questionnaire.id = data.id;
                        this.getSurvey(org, questionnaire.surveyId)
                        .then((d: any) => {
                            const survey = d.data;
                            survey.id = d.id;
                            const formattedResponse = responsesToFhir(
                                responses,
                                questionnaire,
                                survey
                            );
                            callback(false, formattedResponse);
                        })
                        .catch((error) => {
                            console.error("caught in inner inner exportQuestionnaireFhir");
                            callback(true, error);
                        })
                    })
                    .catch((error) => {
                        console.error("caught in inner exportQuestionnaireFhir");
                        callback(true, error);
                    })
            })
            .catch((err) => {
                console.error("caught in outer exportQuestionnaireFhir");
                callback(true, err);
            })        
    }
}

