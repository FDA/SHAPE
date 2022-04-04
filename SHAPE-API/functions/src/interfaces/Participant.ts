interface SecurityQuestion {
    question: string,
    answer: string,
}

export interface Participant {
    securityQuestions: SecurityQuestion[],
    public: boolean,
    participantId: string,
    id?: string,
    org: string,
}
