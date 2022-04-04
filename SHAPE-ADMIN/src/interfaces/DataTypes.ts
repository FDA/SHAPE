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

export interface QuestionRuleEntry {
    fact: string;
    operator: string;
    value: string | number;
}

export interface QuestionRule {
    expression: {
        entries: Array<QuestionRuleEntry>;
    };
    id: number;
    ruleType: string;
    skipTo: string;
}

export interface Options {
    step: number;
    max: number | string;
    min: number | string;
    pin: boolean;
    ticks: boolean;
}

export interface QuestionnaireQuestion {
    id?: string;
    title: string;
    variable: string;
    name: string;
    type: string;
    org?: string; //org assigned with API
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
    min?: number;
    max?: number;
    format?: string;
}

//questionnaire
export interface Questionnaire {
    id?: string;
    shortDescription: string;
    description: string;
    name: string;
    questions?: Array<QuestionnaireQuestion>;
    surveyId: string;
    open: boolean;
    dateCreated: string;
    participants?: Array<string>;
    archived: boolean;
    locked?: boolean;
}

export interface Q13 {
    id: string;
    questionnaire: Questionnaire;
    surveyLocked: boolean;
    href: string;
    storeQuestionnaire: Function;
    duplicate: Function;
}

//Question template
export interface Question {
    title: string;
    variable: string;
    type: string;
    org?: string; //org is added with API
    options?: Options;
    text?: string;
    required?: boolean;
    choices?: Array<QuestionChoice>;
    sections?: Array<InfoSectionType>;
    multiple?: boolean;
    value?: string;
    placeholder?: string;
    requiredMessage?: string;
    min?: number;
    max?: number;
    format?: string;
}

export interface SecurityQuestion {
    question: string;
    answer: string;
}

export interface Person {
    id: number | string;
    name: string;
    dob: string;
    gender: string;
    isNew: boolean;
}

export interface LinkedRecord {
    ehr: EHR;
    patientId: string;
}

export interface EHRReceipt {
    ehr: EHR;
    path: string;
    profile: Person;
    timestamp: string;
}

export interface EHR {
    ehrType: string;
    id: any;
    logo: string;
    name: string;
}

export interface Participant {
    docId?: string;
    org?: string;
    participantId: string;
    public: boolean;
    securityQuestions: Array<SecurityQuestion>;
    optedOut?: boolean;
    purged?: boolean;
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
    participantId: string;
    securityQuestions: Array<SecurityQuestion>;
    profiles: Array<Person>;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    agreedToTerms: boolean;
    agreedToTermsDate: string;
    org?: string;
    linkedRecords?: Array<LinkedRecord>;
    token?: string;
}

export interface Org {
    docId?: string;
    id: string;
    name: string;
    contactName: string;
    adminEmail: string;
    active: boolean;
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

export interface UserAuthenticationObject {
    loggedIn: boolean;
    isAdmin: boolean;
}

export interface AdminUser {
    active: boolean;
    adminEmail: string;
    contactName: string;
    dateCreated: string;
    id: string;
    name: string;
    orgAdmin: boolean;
    userName: string;
    org: string;
}

//org
export interface Organization {
    active: boolean;
    adminEmail: string;
    contactName: string;
    id: string;
    name: string;
}

//message
export interface Message {
    emailRecipients: Array<string>;
    pushRecipients: Array<string>;
    smsRecipients: Array<string>;
    message: string;
    org: string;
    subject: string;
    timestamp: string;
}

//participant-response
export interface ParticipantResponse {
    complete: boolean;
    dateWritten: string | Date;
    id: string;
    org: string;
    participantId: string;
    profile: string;
    profileDOB: string;
    questionnaireId: string;
    responses: Array<Response>;
    surveyId: string;
}

export interface ImageMetadata {
    fileName: string;
    org: string;
    storageId: string;
}
