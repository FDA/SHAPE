export interface Inbox {
    id?:string,
    message: string,
    read: boolean,
    subject: string,
    timestamp: string,
    org: string,
    participantId: string,
    userId: string,
}
