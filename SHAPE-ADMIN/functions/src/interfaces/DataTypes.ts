import { Timestamp } from 'firebase-admin/firestore';

export interface Options {
    step: number;
    max: number;
    min: number;
    pin: boolean;
    ticks: boolean;
    useFaces: boolean;
}

export interface QuestionRule {
    expression: {
        entries: Array<{
            fact: string;
            operator: string;
            value: string;
        }>;
    };
    id: number;
    ruleType: string;
    skipTo?: string;
    addTo?: string;
}

export interface QuestionChoice {
    index?: string;
    order?: number;
    text: string;
    value: string;
    isChecked?: boolean;
}

export interface InfoCardListItem {
    index: string;
    text: string;
    value: string;
}

export interface InfoCardTableCell {
    row: number;
    col: number;
    value: string;
}

export interface InfoCardSection {
    id: string;
    type: string;
}

export interface InfoCardTextSection extends InfoCardSection {
    value: string;
}

export interface InfoCardListSection extends InfoCardSection {
    choices: Array<InfoCardListItem>;
}

export interface InfoCardTableSection extends InfoCardSection {
    cells: Array<InfoCardTableCell>;
    colCount: number;
    rowCount: number;
}

export interface InfoCardImageSection extends InfoCardSection {
    value: string;
    fileName: string;
}

type InfoSectionType =
    | InfoCardTextSection
    | InfoCardListSection
    | InfoCardTableSection
    | InfoCardImageSection;

export interface Profile {
    participantId: string;
    name: string;
    dob: string;
    gender: string;
    href?: string;
    isNew?: boolean;
    age?: number;
    id?: string;
}

export interface Response {
    question: string;
    response: string;
}

export interface ParticipantResponse {
    systemGenerated?: boolean;
    systemGeneratedType?: string;
    systemCompleted?: boolean;
    complete: boolean;
    dateWritten: string | Date | Timestamp;
    id?: string;
    org: string;
    participantId: string;
    profile: string;
    profileDOB: string;
    profileId: string;
    questionnaireId: string;
    responses: Array<Response>;
    surveyId: string;
    userId: string;
}

export interface QuestionnaireQuestion {
    title: string;
    variable: string;
    name: string;
    type: string;
    org: string;
    options?: Options;
    text?: string;
    order?: number;
    required?: boolean;
    rules?: Array<QuestionRule>;
    choices?: Array<QuestionChoice>;
    sections?: Array<InfoSectionType>;
    multiple?: boolean;
    value?: string;
    placeholder?: string;
    orderNumber?: number;
    requiredMessage?: string;
    min?: string;
    max?: string;
    format?: string;
}

export interface Questionnaire {
    id: string;
    shortDescription: string;
    description: string;
    name: string;
    questions: Array<QuestionnaireQuestion>;
    surveyId: string;
    open: boolean;
    dateCreated: string;
    participants: Array<string>;
    archived: boolean;
    locked: boolean;
}

export interface Person {
    id: string;
    name: string;
    dob: string;
    gender: string;
    isNew: boolean;
}

export interface EHR {
    ehrType: string;
    id: any;
    logo: string;
    name: string;
}

export interface LinkedRecord {
    ehr: EHR;
    patientId: string;
}

export interface SecurityQuestion {
    question: string;
    answer: string;
}

export interface Participant {
    docId?: string;
    org?: string;
    userId?: string;
    participantId: string;
    public: boolean;
    securityQuestions: Array<SecurityQuestion>;
    optedOut?: boolean;
    purged?: boolean;
}

export interface ParticipantObject {
    id: string;
    org: string;
}

export interface User {
    docId?: string;
    userName: string;
    password: string;
    active: boolean;
    dateCreated: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    participantId: Array<ParticipantObject>;
    profiles: Array<Person>;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    agreedToTerms: boolean;
    agreedToTermsDate: string;
    org: Array<string>;
    linkedRecords?: Array<LinkedRecord>;
    token?: string;
    orgAdmin?: boolean;
}

export interface MailOptions {
    from: string;
    replyTo: string;
    to: string;
    subject: string; // email subject
    html: string; // email content in HTML
}

export interface InAppNotification {
    notification: {
        title: string;
        body: string;
    };
    tokens: any[];
}

export interface Inbox {
    id?: string;
    message: string;
    read: boolean;
    subject: string;
    timestamp: string;
    org?: string;
    participantId: string;
    userId: string;
}

export interface Message {
    emailRecipients: Array<string>;
    pushRecipients: Array<string>;
    smsRecipients: Array<string>;
    message: string;
    org: string;
    subject: string;
    timestamp: string;
}

export interface DiaryResponse {
    org: string;
    participantId: string;
    profileDOB: string;
    profileName: string;
    surveyId: string;
    formType: string;
    dateWritten: string;
    assessers?: Array<number>; //clinical visit
    assesserText?: string; //clinical visit
    GMFCScore?: string; //clinical visit
    GMFCType?: string; //clinical visit
    eventDate?: string; //clinical visit
    visitReason?: string; //clinical visit
    prescription?: string; //clinical visit
    device?: string; //clinical visit
    withdrawalDate?: string; //withdrawal
    withdrawalReason?: string; //withdrawal
    onsetDate?: string; //event
    endDate?: string; //event
    ongoingStatus?: number | null; //event
    descriptionData?: string; //event
    healthEvent?: number | null; //event
    healthEventSpecification?: string; //event
    outcome?: number | null; //event
    outcomeSpecification?: string; //event
    eventTreatment?: string; //event
    postEventTreatment?: string; //event
    userId: string;
}

export interface InformedConsent {
    id?: string;
    surveyId: string;
    participantId: string;
    emailSent: string;
    dateAgreed: Timestamp;
    org: string;
    userId: string;
}

export interface HistoryLog {
    actionType: string;
    org: string;
    userId?: string;
    participantId?: string;
    questionnaireId?: string;
    surveyId: string;
    timestamp: Timestamp | Date | string;
}

export interface ScheduledJob {
    id: string;
    type: string;
    interval: number;
    enabled: boolean;
    surveyId: string;
}
export interface QuestionnaireCompletedJob extends ScheduledJob {
    duration: number;
    questionnaireToJoin: string;
    questionnaireCompleted: string;
}
export interface SurveyJoinedJob extends ScheduledJob {
    questionnaireToJoin: string;
    duration: number;
}

export interface DiaryNotWrittenJob extends ScheduledJob {
    frequency: number;
    message: string;
}

export interface QNCJob extends ScheduledJob {
    questionnaireNotCompleted: string;
    frequency: number;
    message: string;
}

export interface Survey {
    id?: string;
    archived: boolean;
    name: string;
    shortDescription: string;
    description: string;
    informedConsent: string;
    open: boolean;
    dateCreated: string;
    org?: string;
    participants?: Array<string>;
    locked?: boolean;
    public?: boolean;
    scheduledJobs?: Array<ScheduledJob & QuestionnaireCompletedJob & SurveyJoinedJob & QNCJob>;
}

export interface EHRReceipt {
    ehr: EHR;
    path: string;
    profile: Person;
    timestamp: string;
}

export interface EHRDocument {
    org: string;
    participantId: string;
    receipts: EHRReceipt[];
    userId: string;
}
