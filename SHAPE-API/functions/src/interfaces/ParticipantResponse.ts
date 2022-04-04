export interface ParticipantResponse {
    id?:string,
    surveyId: string,
    questionnaireId: string,
    profile: string,
    profileDOB: string,
    participantId: string,
    dateWritten: string,
    complete?:boolean,
    responses?:Response[],
    org: string,
}

interface Response {
    question: string,
    response: string
}
