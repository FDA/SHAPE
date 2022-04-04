interface Profile {
    dob: string,
    gender: string,
    id: string,
    isNew: boolean,
    name: string,
}

interface SecurityQuestion {
    answer: string,
    question: string,
}

export interface User {
    id?: string,
    active: boolean,
    agreedToTerms?: boolean,
    agreedToTermsDate?: string,
    dateCreated?: string,
    emailEnabled?: boolean,
    firstName?: string,
    lastName?: string,
    participantId?: string,
    phoneNumber?: string,
    profiles?: Profile[],
    pushEnabled?: boolean,
    securityQuestions?: SecurityQuestion[],
    smsEnabled?: boolean,
    userName?: string,
    org: string,
}
