export interface Message {
    id?: string,
    emailRecipients: string[],
    pushRecipients: string[],
    smsRecipients: string[],
    message: string,
    subject: string,
    timestamp: string,
    org: string,
}
  