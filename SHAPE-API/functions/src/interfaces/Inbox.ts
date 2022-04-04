interface Message {
    id: string,
    message: string,
    read: boolean,
    subject: string,
    timestamp: string,
}

export interface Inbox {
    id?:string,
    messages: Message[],
    org: string,
    participantId: string,
}
