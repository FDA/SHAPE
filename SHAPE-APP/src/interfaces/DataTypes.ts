/******** Collection Types *********/

import { Timestamp } from 'firebase/firestore';

//org
export interface Organization {
    active: boolean;
    adminEmail: string;
    contactName: string;
    id: string;
    name: string;
}

//participant
export interface Participant {
    org: string;
    participantId: string;
    public: boolean;
    securityQuestions: Array<SecurityQuestion>;
    optedOut?: boolean;
    purged?: boolean;
}

//participant-diary
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
}

//participant-response
export interface ParticipantResponse {
    complete: boolean;
    dateWritten: string | Date | Timestamp;
    id: string;
    org: string;
    participantId: string;
    profile: string;
    profileDOB: string;
    profileId: string;
    questionnaireId: string;
    responses: Array<Response>;
    surveyId: string;
    userId: string;
    systemGenerated?: boolean;
    systemGeneratedType?: string;
}

//questionnaire
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

//survey
export interface Survey {
    id: string;
    archived: boolean;
    name: string;
    shortDescription: string;
    description: string;
    informedConsent: string;
    open: boolean;
    dateCreated: string;
    org: string;
    participants: Array<string>;
    public?: boolean;
}

export interface ParticipantObject {
    org: string;
    id: string;
}

//users
export interface User {
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
}

/******* Sub Types ********/

export interface Answer {
    name: string;
    value: string;
}

export interface EHR {
    ehrType: string;
    id: any;
    logo: string;
    name: string;
}

export interface EHRReceipt {
    ehr: EHR;
    path: string;
    profile: Person;
    timestamp: string;
}

export interface InformedConsent {
    dateAgreed: Date;
    emailSent: string;
    org: string;
    participantId: string;
    surveyId: string;
    userId: string;
}

export interface LinkedRecord {
    ehr: EHR;
    patientId: string;
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

export interface Person {
    id: number | string;
    name: string;
    dob: string;
    gender: string;
    isNew?: boolean;
}

export interface Options {
    step: number;
    max: number;
    min: number;
    pin: boolean;
    ticks: boolean;
    useFaces: boolean;
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

type InfoSectionType =
    | InfoCardTextSection
    | InfoCardListSection
    | InfoCardTableSection
    | InfoCardImageSection;

export interface QuestionnaireInfoQuestion extends QuestionnaireQuestion {
    sections: Array<InfoSectionType>;
}

export interface QuestionChoice {
    index?: string;
    order?: number;
    text: string;
    value: string;
    isChecked?: boolean;
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

export interface SecurityQuestion {
    question: string;
    answer: string;
}

/******* Redux Types ******/

export interface Account {
    userName: string;
    password: string;
}

interface UserAuthenticationObject {
    loggedIn: boolean;
    isAdmin: boolean;
}

export interface AuthenticationObject {
    authError: string | null;
    errorMessage?: string | null;
    errorCode?: string;
    registrationSuccess?: boolean;
    loggedIn: boolean;
    isAdmin: boolean;
    user: UserAuthenticationObject;
    profile: Person;
}

export interface ParticipantLookup extends Participant {
    querySuccess: boolean;
    registrationExists: boolean;
}

interface ProviderData {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    email: string;
    phoneNumber: string | null;
    providerId: string;
}

interface STSTokenManager {
    apiKey: string;
    refreshToken: string;
    accessToken: string;
    expirationTime: any;
}

export interface FirebaseAuth {
    isLoaded: boolean;
    isEmpty: boolean;
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    email: string;
    emailVerified: boolean;
    phoneNumber: string | null;
    isAnonymous: boolean;
    tenantId: string | null;
    providerData: Array<ProviderData>;
    apiKey: string;
    appName: string;
    authDomain: string;
    stsTokenManager: STSTokenManager;
    redirectEventId: string | null;
    lastLoginAt: string | null;
    createdAt: string;
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

/**** Component Types ******/

export type formType = '' | 'Clinical Visit' | 'Emergency Room Visit' | 'Seizure' | 'Event Form';

export interface Choice {
    id: string;
    name: string;
}

export interface Diary {
    formType: string;
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

export interface Q13Card {
    href: string;
    participantResponse: Array<ParticipantResponse>;
    numQuestions: number;
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    profile: User;
    questionnaireView: string;
}

export interface RegisteringUser {
    userName: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
}

export interface RegisteringUserWithPassword extends RegisteringUser {
    password: string;
}

export interface Response {
    question: string;
    response: string;
}

export interface SurveyCard {
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    status: boolean;
    questionnaires: Array<Questionnaire>;
    onClick: Function;
    participantResponse: ParticipantResponse[];
    profile: User;
}

export interface Target {
    surveyId: string;
    questionnaireId: string;
    participantId: string;
    profileName: string;
}
