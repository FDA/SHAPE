import { Participant, Question } from ".";

export interface Questionnaire {
    id?: string,
    surveyId: string,
    name: string,
    shortDescription: string,
    description: string,
    dateCreated: string,
    open:boolean,
    archived:boolean,
    locked?: boolean,
    participants?: Participant[],
    questions?: Question[],
    org?: string,
    public?: boolean,
    form?: AcForm
}

interface AcForm {
   OID: string,
   Name: string
}
