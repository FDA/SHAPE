import { Participant } from ".";

export interface Survey {
    id?: string,
    name: string,
    shortDescription: string,
    description: string,
    informedConsent: string,
    open:boolean,
    locked?: boolean,
    archived:boolean,
    participants?: Participant[],
    dateCreated: string,
    org?:string
}
